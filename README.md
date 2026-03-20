[![action-setup-kube-tools Test](https://github.com/yokawasa/action-setup-kube-tools/actions/workflows/test.yml/badge.svg)](https://github.com/yokawasa/action-setup-kube-tools/actions/workflows/test.yml)

# action-setup-kube-tools
A GitHub Action that setup Kubernetes tools (kubectl, kustomize, helm, kubeconform, conftest, yq, rancher, tilt, skaffold, kube-score) and cache them on the runner. It is like a typescript version of [stefanprodan/kube-tools](https://github.com/stefanprodan/kube-tools) with no command input param, but as compared with [it](https://github.com/stefanprodan/kube-tools), it's **very fast** as it installs the tools asynchronously.

## Usage

### Inputs

|Parameter|Required|Default Value|Description|
|:--:|:--:|:--:|:--|
|`fail-fast`|`false`|`true`| the action immediately fails when it fails to download (ie. due to a bad version) |
|`arch-type`|`false`|`""`| Optional. The processor architecture type of the tool binary to setup. The action will auto-detect the architecture (`amd64` or `arm64`) and use it as appropriate at runtime. Specify the architecture type (`amd64` or `arm64`) only if you need to force it.|
|`setup-tools`|`false`|`""`|List of tool name to setup. By default, the action download and setup all supported Kubernetes tools. By specifying `setup-tools` you can choose which tools the action setup. Supported separator is `return` in multi-line string. Supported tools are `kubectl`, `kustomize`, `helm`, `helmv3`,  `kubeval`, `conftest`, `yq`, `rancher`, `tilt`, `skaffold`, `kube-score`|
|`kubectl`|`false`|`1.34.1`| kubectl version or `latest`. kubectl versions can be found [here](https://github.com/kubernetes/kubernetes/releases)|
|`kustomize`|`false`|`5.7.1`| kustomize version or `latest`. kustomize versions can be found [here](https://github.com/kubernetes-sigs/kustomize/releases)|
|`helm`|`false`|`3.19.0`| helm version or `latest`. helm versions can be found [here](https://github.com/helm/helm/releases)|
|`kubeval`|`false`|`0.16.1`| kubeval version (must be **0.16.1+**) or `latest`. kubeval versions can be found [here](https://github.com/instrumenta/kubeval/releases).<br> NOTE: this parameter is deprecating as `kubeval` is no longer maintained. A good replacement is [kubeconform](https://github.com/yannh/kubeconform). See also [this](https://github.com/instrumenta/kubeval) for more details.|
|`kubeconform`|`false`|`0.7.0`| kubeconform version or `latest`. kubeconform versions can be found [here](https://github.com/yannh/kubeconform/releases)|
|`conftest`|`false`|`0.62.0`| conftest version or `latest`. conftest versions can be found [here](https://github.com/open-policy-agent/conftest/releases)|
|`yq`|`false`|`4.47.2`| yq version or `latest`. yq versions can be found [here](https://github.com/mikefarah/yq/releases/)|
|`rancher`|`false`|`2.12.1`| Rancher CLI version or `latest`. Rancher CLI versions can be found [here](https://github.com/rancher/cli/releases)|
|`tilt`|`false`|`0.35.1`| Tilt version or `latest`. Tilt versions can be found [here](https://github.com/tilt-dev/tilt/releases)|
|`skaffold`|`false`|`2.16.1`| Skaffold version or `latest`. Skaffold versions can be found [here](https://github.com/GoogleContainerTools/skaffold/releases)|
|`kube-score`|`false`|`1.20.0`| kube-score version or `latest`. kube-score versions can be found [here](https://github.com/zegl/kube-score/releases)|

> [!NOTE]
> - Supported Environments: `Linux`
> - From `v0.7.0`, the action supports tool version 'v' prefix. Prior to v0.7.0, the action only accept the tool version without 'v' prefix but from v0.7.0 the action automatically add/remove the prefix as necessary
> - From `v0.13.X`, the action supports `latest` as tool version. If a tool input is set to `latest`, the action resolves the latest version at runtime, then downloads and caches that exact version. However, using `latest` can make builds non-reproducible, as the installed version may change over time. For stable and repeatable builds, **it is recommended to specify exact versions**

### Outputs
|Parameter|Description|
|:--:|:--|
|`kubectl-path`| kubectl command path if the action setup the tool, otherwise empty string |
|`kustomize-path`| kustomize command path if the action setup the tool, otherwise empty string |
|`helm-path`| helm command path if the action setup the tool, otherwise empty string |
|`kubeval-path`| kubeval command path if the action setup the tool, otherwise empty string |
|`kubeconform-path`| kubeconform command path if the action setup the tool, otherwise empty string |
|`conftest-path`| conftest command path if the action setup the tool, otherwise empty string |
|`yq-path`| yq command path if the action setup the tool, otherwise empty string |
|`rancher-path`| rancher command path if the action setup the tool, otherwise empty string |
|`tilt-path`| rancher command path if the action setup the tool, otherwise empty string |
|`skaffold-path`| rancher command path if the action setup the tool, otherwise empty string |
|`kube-score-path:`| rancher command path if the action setup the tool, otherwise empty string |

### Sample Workflow

Pinned versions (reproducible):

```yaml
  test: 
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: yokawasa/action-setup-kube-tools@v0.13.2
      with:
        kubectl: '1.34.1'
        kustomize: '5.7.1'
        helm: '3.19.0'
        kubeconform: '0.7.0'
        conftest: '0.62.0'
        rancher: '2.12.1'
        tilt: '0.35.2'
        skaffold: '2.16.1'
        kube-score: '1.20.0'
    - run: |
        kubectl version --client
        kustomize version
        helm version
        kubeconform -v
        conftest --version
        yq --version
        rancher --version
        tilt version
        skaffold version
        kube-score version
```

Default versions for the commands will be setup if you don't give any inputs like this:

```yaml
  test: 
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: yokawasa/action-setup-kube-tools@v0.13.2
    - run: |
        kubectl version --client
        kustomize version
        helm version
        kubeconform -v
        conftest --version
        yq --version
        rancher --version
        tilt version
        skaffold version
        kube-score version
```

By specifying setup-tools you can choose which tools the action setup. Supported separator is return in multi-line string like this

```yaml
  test: 
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: yokawasa/action-setup-kube-tools@v0.13.2
      with:
        setup-tools: |
          kubectl
          helm
          kustomize
          skaffold
        kubectl: '1.25'
        helm: '3.11.1'
        kustomize: '5.0.0'
        skaffold: '2.1.0'
    - run: |
        kubectl version --client
        kustomize version
        helm version
        skaffold version
```

Architecture is automatically detected on the runner (amd64 or arm64). You can optionally force it by specifying `arch-type: 'amd64'` or `arch-type: 'arm64'`.

```yaml
  test: 
    steps:
    - uses: actions/checkout@v4
    - uses: yokawasa/action-setup-kube-tools@v0.13.2
      with:
        # arch-type is optional; uncomment to force arm64
        # arch-type: 'arm64'
        setup-tools: |
          kubectl
          helm
          kustomize
          skaffold
        kubectl: '1.25'
        helm: '3.11.1'
        kustomize: '5.0.0'
        skaffold: '2.1.0'
    - run: |
        kubectl version --client
        kustomize version
        helm version
        skaffold version
```

Explicit latest inputs (optional):

```yaml
  test: 
    steps:
    - uses: actions/checkout@v4
    - uses: yokawasa/action-setup-kube-tools@v0.13.2
      with:
        # arch-type is optional; uncomment to force arm64
        # arch-type: 'arm64'
        setup-tools: |
          kubectl
          helm
          kustomize
          skaffold
        kubectl: latest
        helm: latest
        kustomize: latest
        skaffold: latest
    - run: |
        kubectl version --client
        kustomize version
        helm version
        skaffold version
```

Note: Using `latest` makes builds non-reproducible since versions can change over time. Prefer pinning exact versions for stability.


## Developing the action

Install the dependencies  
```bash
npm install
```

Build the typescript and package it for distribution by running [ncc](https://github.com/zeit/ncc)
```bash
npm run build && npm run format && npm run lint && npm run pack
```

Finally push the results
```
git add dist
git commit -a -m "prod dependencies"
git push origin releases/v0.13.X
```

## References

- https://kubernetes.io/releases/
- https://github.com/kubernetes-sigs/kustomize/releases
- https://github.com/helm/helm/releases
- https://helm.sh/docs/topics/version_skew/
- https://github.com/instrumenta/kubeval/releases
- https://github.com/open-policy-agent/conftest/releases
- https://github.com/mikefarah/yq/releases
- https://github.com/rancher/cli/releases
- https://github.com/tilt-dev/tilt/releases
- https://github.com/GoogleContainerTools/skaffold/releases
- https://github.com/zegl/kube-score/releases

## Contributing
Bug reports and pull requests are welcome on GitHub at https://github.com/yokawasa/action-setup-kube-tools

## Changelog

Please see the [list of releases](https://github.com/yokawasa/action-setup-kube-tools/releases) for information on changes between releases.
