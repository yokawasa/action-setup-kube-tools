import * as os from 'os'
import * as path from 'path'
import * as util from 'util'
import * as fs from 'fs'
import * as https from 'https'

import * as toolCache from '@actions/tool-cache'
import * as core from '@actions/core'

const defaultProcessorArchType = 'amd64'

// Determine the processor architecture type based on the current runtime.
// Maps Node's os.arch() to the values used by download URLs: 'amd64' | 'arm64'
function detectArchType(): string {
  const nodeArch = os.arch().toLowerCase()
  if (nodeArch === 'arm64' || nodeArch === 'aarch64') {
    return 'arm64'
  }
  return 'amd64'
}
interface Tool {
  name: string
  defaultVersion: string
  isArchived: boolean
  supportArm: boolean
  commandPathInPackage: string
}

const Tools: Tool[] = [
  {
    name: 'kubectl',
    defaultVersion: 'latest',
    isArchived: false,
    supportArm: true,
    commandPathInPackage: 'kubectl'
  },
  {
    name: 'kustomize',
    defaultVersion: 'latest',
    isArchived: true,
    supportArm: true,
    commandPathInPackage: 'kustomize'
  },
  {
    name: 'helm',
    defaultVersion: 'latest',
    isArchived: true,
    supportArm: true,
    commandPathInPackage: 'linux-{arch}/helm'
  },
  {
    name: 'kubeval',
    defaultVersion: 'latest',
    isArchived: true,
    supportArm: false,
    commandPathInPackage: 'kubeval'
  },
  {
    name: 'kubeconform',
    defaultVersion: 'latest',
    isArchived: true,
    supportArm: true,
    commandPathInPackage: 'kubeconform'
  },
  {
    name: 'conftest',
    defaultVersion: 'latest',
    isArchived: true,
    supportArm: true,
    commandPathInPackage: 'conftest'
  },
  {
    name: 'yq',
    defaultVersion: 'latest',
    isArchived: false,
    supportArm: true,
    commandPathInPackage: 'yq_linux_{arch}'
  },
  {
    name: 'rancher',
    defaultVersion: 'latest',
    isArchived: true,
    supportArm: true,
    commandPathInPackage: 'rancher-v{ver}/rancher'
  },
  {
    name: 'tilt',
    defaultVersion: 'latest',
    isArchived: true,
    supportArm: true,
    commandPathInPackage: 'tilt'
  },
  {
    name: 'skaffold',
    defaultVersion: 'latest',
    isArchived: false,
    supportArm: true,
    commandPathInPackage: 'skaffold-linux-{arch}'
  },
  {
    name: 'kube-score',
    defaultVersion: 'latest',
    isArchived: false,
    supportArm: true,
    commandPathInPackage: 'kube-score'
  }
]

// Replace all {ver} and {arch} placeholders in the source format string with the actual values
function replacePlaceholders(
  format: string,
  version: string,
  archType: string
): string {
  return format.replace(/{ver}|{arch}/g, match => {
    return match === '{ver}' ? version : archType
  })
}

// Perform a simple HTTPS GET and return the response body as string
async function httpGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'yokawasa/action-setup-kube-tools',
          Accept: 'application/vnd.github+json'
        }
      },
      res => {
        if (!res.statusCode) {
          reject(new Error(`Request failed: ${url}`))
          return
        }
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          //// SSRF attach protection (Disabled for now to avoid many allowed domain changes)
          // Validate redirect location domain to avoid SSRF attack before following it.
          // Need to add domain names to allow as needed in the future
          // try {
          //   const allowedDomains = [
          //     'github.com',
          //     'api.github.com',
          //     'raw.githubusercontent.com',
          //     'dl.k8s.io',
          //     'cdn.dl.k8s.io',
          //     'get.helm.sh',
          //     'storage.googleapis.com'
          //   ]
          //   const redirectUrl = new URL(res.headers.location, url)
          //   if (!allowedDomains.includes(redirectUrl.hostname)) {
          //     reject(
          //       new Error(
          //         `Redirect to disallowed domain: ${redirectUrl.hostname}`
          //       )
          //     )
          //     return
          //   }
          //   httpGet(redirectUrl.toString())
          //     .then(resolve)
          //     .catch(reject)
          // } catch (e) {
          //   reject(new Error(`Invalid redirect URL: ${res.headers.location}`))
          // }

          //// Follow the redirect
          httpGet(res.headers.location)
            .then(resolve)
            .catch(reject)
          return
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Request failed: ${url} (status ${res.statusCode})`))
          return
        }
        let data = ''
        res.on('data', chunk => (data += chunk))
        res.on('end', () => resolve(data))
        return
      }
    )
    req.on('error', reject)
  })
}

// Normalize tag to a bare version (strip prefixes like 'v' or 'kustomize/v')
function normalizeTagToVersion(tag: string, toolName: string): string {
  let t = tag.trim()
  if (toolName === 'kustomize') {
    if (t.startsWith('kustomize/')) {
      t = t.substring('kustomize/'.length)
    }
  }
  if (t.startsWith('v') || t.startsWith('V')) {
    t = t.substring(1)
  }
  return t
}

async function getLatestVersion(toolName: string): Promise<string> {
  try {
    if (toolName === 'kubectl') {
      const body = await httpGet('https://dl.k8s.io/release/stable.txt')
      return normalizeTagToVersion(body, toolName)
    }

    const repoMap: {[key: string]: string} = {
      kustomize: 'kubernetes-sigs/kustomize',
      helm: 'helm/helm',
      kubeval: 'instrumenta/kubeval',
      kubeconform: 'yannh/kubeconform',
      conftest: 'open-policy-agent/conftest',
      yq: 'mikefarah/yq',
      rancher: 'rancher/cli',
      tilt: 'tilt-dev/tilt',
      skaffold: 'GoogleContainerTools/skaffold',
      'kube-score': 'zegl/kube-score'
    }
    const repo = repoMap[toolName]
    if (!repo) {
      throw new Error(`Unsupported tool for latest lookup: ${toolName}`)
    }
    const api = `https://api.github.com/repos/${repo}/releases/latest`
    const json = await httpGet(api)
    let meta
    try {
      meta = JSON.parse(json)
    } catch (e) {
      // Truncate the response for safety if it's too long: #75
      const truncatedJson =
        json && json.length > 500
          ? json.substring(0, 500) + '...[truncated]'
          : json
      throw new Error(
        `Failed to parse JSON response from ${api} for ${toolName}: ${e}. Response: ${truncatedJson}`
      )
    }
    if (!meta || !meta.tag_name) {
      throw new Error(`Unexpected response resolving latest for ${toolName}`)
    }
    return normalizeTagToVersion(String(meta.tag_name), toolName)
  } catch (e) {
    throw new Error(`Failed to resolve latest version for ${toolName}: ${e}`)
  }
}

function getDownloadURL(
  commandName: string,
  version: string,
  archType: string
): string {
  let actualArchType = archType
  let urlFormat = ''
  switch (commandName) {
    case 'kubectl':
      urlFormat = 'https://dl.k8s.io/release/v{ver}/bin/linux/{arch}/kubectl'
      break
    case 'kustomize':
      urlFormat =
        'https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv{ver}/kustomize_v{ver}_linux_{arch}.tar.gz'
      break
    case 'helm':
      urlFormat = 'https://get.helm.sh/helm-v{ver}-linux-{arch}.tar.gz'
      break
    case 'kubeval':
      actualArchType = 'amd64' // kubeval only supports amd64
      urlFormat =
        'https://github.com/instrumenta/kubeval/releases/download/v{ver}/kubeval-linux-{arch}.tar.gz'
      break
    case 'kubeconform':
      urlFormat =
        'https://github.com/yannh/kubeconform/releases/download/v{ver}/kubeconform-linux-{arch}.tar.gz'
      break
    case 'conftest':
      actualArchType = archType === 'arm64' ? archType : 'x86_64'
      urlFormat =
        'https://github.com/open-policy-agent/conftest/releases/download/v{ver}/conftest_{ver}_Linux_{arch}.tar.gz'
      break
    case 'yq':
      urlFormat =
        'https://github.com/mikefarah/yq/releases/download/v{ver}/yq_linux_{arch}'
      break
    case 'rancher':
      actualArchType = archType === 'arm64' ? 'arm' : archType
      urlFormat =
        'https://github.com/rancher/cli/releases/download/v{ver}/rancher-linux-{arch}-v{ver}.tar.gz'
      break
    case 'tilt':
      actualArchType = archType === 'arm64' ? archType : 'x86_64'
      urlFormat =
        'https://github.com/tilt-dev/tilt/releases/download/v{ver}/tilt.{ver}.linux.{arch}.tar.gz'
      break
    case 'skaffold':
      urlFormat =
        'https://github.com/GoogleContainerTools/skaffold/releases/download/v{ver}/skaffold-linux-{arch}'
      break
    case 'kube-score':
      urlFormat =
        'https://github.com/zegl/kube-score/releases/download/v{ver}/kube-score_{ver}_linux_{arch}'
      break
    default:
      return ''
  }
  return replacePlaceholders(urlFormat, version, actualArchType)
}

async function downloadTool(
  version: string,
  archType: string,
  tool: Tool
): Promise<string> {
  let cachedToolPath = toolCache.find(tool.name, version)
  let commandPathInPackage = tool.commandPathInPackage
  let commandPath = ''

  if (!cachedToolPath) {
    const downloadURL = getDownloadURL(tool.name, version, archType)

    try {
      const packagePath = await toolCache.downloadTool(downloadURL)

      if (tool.isArchived) {
        const extractTarBaseDirPath = util.format(
          '%s_%s',
          packagePath,
          tool.name
        )

        fs.mkdirSync(extractTarBaseDirPath)

        const extractedDirPath = await toolCache.extractTar(
          packagePath,
          extractTarBaseDirPath
        )

        commandPathInPackage = replacePlaceholders(
          commandPathInPackage,
          version,
          archType
        )
        commandPath = util.format(
          '%s/%s',
          extractedDirPath,
          commandPathInPackage
        )
      } else {
        commandPath = packagePath
      }
    } catch (exception) {
      throw new Error(`Download ${tool.name} Failed! (url: ${downloadURL})`)
    }
    cachedToolPath = await toolCache.cacheFile(
      commandPath,
      tool.name,
      tool.name,
      version
    )
    // eslint-disable-next-line no-console
    console.log(`${tool.name} version '${version}' has been cached`)
  } else {
    // eslint-disable-next-line no-console
    console.log(`Found in cache: ${tool.name} version '${version}'`)
  }

  const cachedCommand = path.join(cachedToolPath, tool.name)
  fs.chmodSync(cachedCommand, '777')
  return cachedCommand
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function run() {
  if (!os.type().match(/^Linux/)) {
    throw new Error('The action only support Linux OS!')
  }

  let failFast = true
  if (core.getInput('fail-fast', {required: false}).toLowerCase() === 'false') {
    failFast = false
  }

  // Auto-detect architecture; allow explicit override to 'amd64' or 'arm64' if provided.
  let archType = detectArchType()
  console.log(`Detected archType: ${archType}`)
  const inputArch = core.getInput('arch-type', {required: false}).toLowerCase()
  console.log(`input archType: ${inputArch}`)
  if (inputArch === 'arm64' || inputArch === 'amd64') {
    archType = inputArch
  }

  let setupToolList: string[] = []
  const setupTools = core.getInput('setup-tools', {required: false}).trim()
  if (setupTools) {
    setupToolList = setupTools
      .split('\n')
      .map(function(x) {
        return x.trim()
      })
      .filter(x => x !== '')
  }

  // eslint-disable-next-line github/array-foreach
  Tools.forEach(async function(tool) {
    let toolPath = ''
    // By default, the action setup all supported Kubernetes tools, which mean
    // all tools can be setup when setuptools does not have any elements.
    if (setupToolList.length === 0 || setupToolList.includes(tool.name)) {
      let toolVersion = core
        .getInput(tool.name, {required: false})
        .toLowerCase()
      if (toolVersion && toolVersion.startsWith('v')) {
        toolVersion = toolVersion.substr(1)
      }
      if (!toolVersion) {
        toolVersion = tool.defaultVersion
      }
      if (toolVersion === 'latest') {
        try {
          const resolved = await getLatestVersion(tool.name)
          // eslint-disable-next-line no-console
          console.log(`Resolved latest for ${tool.name}: ${resolved}`)
          toolVersion = resolved
        } catch (e) {
          if (failFast) {
            // eslint-disable-next-line no-console
            console.log(`Exiting immediately (fail fast) - [Reason] ${e}`)
            process.exit(1)
          } else {
            throw new Error(`Cannot resolve a version for ${tool.name}.`)
          }
        }
      }
      if (archType === 'arm64' && !tool.supportArm) {
        // eslint-disable-next-line no-console
        console.log(
          `The ${tool.name} does not support arm64 architecture, skip it`
        )
        return
      }

      try {
        const cachedPath = await downloadTool(toolVersion, archType, tool)
        core.addPath(path.dirname(cachedPath))
        toolPath = cachedPath
      } catch (exception) {
        if (failFast) {
          // eslint-disable-next-line no-console
          console.log(`Exiting immediately (fail fast) - [Reason] ${exception}`)
          process.exit(1)
        }
      }
    }
    core.setOutput(`${tool.name}-path`, toolPath)
  })
}

run().catch(core.setFailed)
