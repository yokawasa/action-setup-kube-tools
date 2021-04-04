import * as os from 'os'
import * as path from 'path'
import * as util from 'util'
import * as fs from 'fs'

import * as toolCache from '@actions/tool-cache'
import * as core from '@actions/core'

const defaultKubectlVersion = '1.18.2'
const defaultKustomizeVersion = '3.5.5'
const defaultHelmVersion = '2.17.0'
const defaultHelmv3Version = '3.5.2'
const defaultKubevalVersion = '0.15.0'
const defaultConftestVersion = '0.19.0'
const defaultYqVersion = 'latest'
const defaultRancherVersion = '2.4.10'
const defaultTiltVersion = '0.18.11'
const defaultSkaffoldVersion = '1.20.0'
const defaultKubeScoreVersion = '1.10.1'

interface Tool {
  name: string
  defaultVersion: string
  isArchived: boolean
  commandPathInPackage: string
}

const Tools: Tool[] = [
  {
    name: 'kubectl',
    defaultVersion: defaultKubectlVersion,
    isArchived: false,
    commandPathInPackage: 'kubectl'
  },
  {
    name: 'kustomize',
    defaultVersion: defaultKustomizeVersion,
    isArchived: true,
    commandPathInPackage: 'kustomize'
  },
  {
    name: 'helm',
    defaultVersion: defaultHelmVersion,
    isArchived: true,
    commandPathInPackage: 'linux-amd64/helm'
  },
  {
    name: 'helmv3',
    defaultVersion: defaultHelmv3Version,
    isArchived: true,
    commandPathInPackage: 'linux-amd64/helm'
  },
  {
    name: 'kubeval',
    defaultVersion: defaultKubevalVersion,
    isArchived: true,
    commandPathInPackage: 'kubeval'
  },
  {
    name: 'conftest',
    defaultVersion: defaultConftestVersion,
    isArchived: true,
    commandPathInPackage: 'conftest'
  },
  {
    name: 'yq',
    defaultVersion: defaultYqVersion,
    isArchived: false,
    commandPathInPackage: 'yq_linux_amd64'
  },
  {
    name: 'rancher',
    defaultVersion: defaultRancherVersion,
    isArchived: true,
    commandPathInPackage: 'rancher-v%s/rancher'
  },
  {
    name: 'tilt',
    defaultVersion: defaultTiltVersion,
    isArchived: true,
    commandPathInPackage: 'tilt'
  },
  {
    name: 'skaffold',
    defaultVersion: defaultSkaffoldVersion,
    isArchived: false,
    commandPathInPackage: 'skaffold-linux-amd64'
  },
  {
    name: 'kube-score',
    defaultVersion: defaultKubeScoreVersion,
    isArchived: false,
    commandPathInPackage: 'kube-score'
  }
]

function getDownloadURL(commandName: string, version: string): string {
  switch (commandName) {
    case 'kubectl':
      return util.format(
        'https://storage.googleapis.com/kubernetes-release/release/v%s/bin/linux/amd64/kubectl',
        version
      )
    case 'kustomize':
      return util.format(
        'https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv%s/kustomize_v%s_linux_amd64.tar.gz',
        version,
        version
      )
    case 'helm':
      return util.format(
        'https://get.helm.sh/helm-v%s-linux-amd64.tar.gz',
        version
      )
    case 'helmv3':
      return util.format(
        'https://get.helm.sh/helm-v%s-linux-amd64.tar.gz',
        version
      )
    case 'kubeval':
      return util.format(
        'https://github.com/instrumenta/kubeval/releases/download/%s/kubeval-linux-amd64.tar.gz',
        version
      )
    case 'conftest':
      return util.format(
        'https://github.com/open-policy-agent/conftest/releases/download/v%s/conftest_%s_Linux_x86_64.tar.gz',
        version,
        version
      )
    case 'yq':
      return util.format(
        'https://github.com/mikefarah/yq/releases/%s/download/yq_linux_amd64',
        version
      )
    case 'rancher':
      return util.format(
        'https://github.com/rancher/cli/releases/download/v%s/rancher-linux-amd64-v%s.tar.gz',
        version,
        version
      )
    case 'tilt':
      return util.format(
        'https://github.com/tilt-dev/tilt/releases/download/v%s/tilt.%s.linux.x86_64.tar.gz',
        version,
        version
      )
    case 'skaffold':
      return util.format(
        'https://github.com/GoogleContainerTools/skaffold/releases/download/v%s/skaffold-linux-amd64',
        version
      )
    case 'kube-score':
      return util.format(
        'https://github.com/zegl/kube-score/releases/download/v%s/kube-score_%s_linux_amd64',
        version,
        version
      )
    default:
      return ''
  }
}

async function downloadTool(version: string, tool: Tool): Promise<string> {
  let cachedToolPath = toolCache.find(tool.name, version)
  let commandPathInPackage = tool.commandPathInPackage
  let commandPath = ''

  if (!cachedToolPath) {
    const downloadURL = getDownloadURL(tool.name, version)

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

        if (commandPathInPackage.indexOf('%s') > 0) {
          commandPathInPackage = util.format(commandPathInPackage, version)
        }
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

  let setupToolList: string[] = []
  const setupTools = core
    .getInput('setup-tools', {required: false})
    .replace(/\s/g, '')
  if (setupTools) {
    //setupToolList = setupTools.split('\n').filter(x => x !== '')
    setupToolList = setupTools.split('\n').filter(function(x) {
      return x.replace(/\s/g, '') !== ''
    })
  }
  // eslint-disable-next-line no-console
  console.log(`setupToos=${setupTools}`)
  // eslint-disable-next-line no-console
  console.log(`setupToolList.length=${setupToolList.length}`)
  for (let i = 0; i < setupToolList.length; i++) {
    // eslint-disable-next-line no-console
    console.log(`setupToolList[${i}]=${setupToolList[i]}`)
  }

  // eslint-disable-next-line github/array-foreach
  Tools.forEach(async function(tool) {
    let toolPath = ''
    // By default, the action setup all supported Kubernetes tools, which mean
    // all tools can be setup when setuptools does not have any elements.
    // eslint-disable-next-line no-console
    console.log(`tool.name=${tool.name}`)
    if (setupToolList.length === 0 || setupToolList.includes(tool.name)) {
      // eslint-disable-next-line no-console
      console.log(`setting up tool.name: ${tool.name}`)
      let toolVersion = core.getInput(tool.name, {required: false})
      // eslint-disable-next-line no-console
      console.log(`tool version: ${toolVersion}`)
      if (!toolVersion) {
        toolVersion = tool.defaultVersion
      }
      const cachedPath = await downloadTool(toolVersion, tool)
      core.addPath(path.dirname(cachedPath))
      toolPath = cachedPath
    }
    core.setOutput(`${tool.name}-path`, toolPath)
  })
}

run().catch(core.setFailed)
