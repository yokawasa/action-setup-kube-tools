[![action-setup-kube-tools Test](https://github.com/yokawasa/action-setup-kube-tools/actions/workflows/test.yml/badge.svg)](https://github.com/yokawasa/action-setup-kube-tools/actions/workflows/test.yml)

# action-setup-kube-tools
A GitHub Action that setup Kubernetes tools (kubectl, kustomize, helm, kubeconform, conftest, yq, rancher, tilt, skaffold, kube-score) and cache them on the runner. It is like a typescript version of [stefanprodan/kube-tools](https://github.com/stefanprodan/kube-tools) with no command input param, but as compared with [it](https://github.com/stefanprodan/kube-tools), it's **very fast** as it installs the tools asynchronously.

## Usage

### Inputs

|Parameter|Required|Default Value|Description|
|:--:|:--:|:--:|:--|
|`fail-fast`|`false`|`true`| the action immediately fails when it fails to download (ie. due to a bad version) |
|`arch-type`|`false`|`amd64`| The processor architecture type of the tool binary to setup. Supported types are only `amd64` and `arm64`. If a type other than the supported Types is specified, it will be treated as `amd64`.|
|`setup-tools`|`false`|`""`|List of tool name to setup. By default, the action download and setup all supported Kubernetes tools. By specifying `setup-tools` you can choose which tools the action setup. Supported separator is `return` in multi-line string. Supported tools are `kubectl`, `kustomize`, `helm`, `helmv3`,  `kubeval`, `conftest`, `yq`, `rancher`, `tilt`, `skaffold`, `kube-score`|
|`kubectl`|`false`|`1.24.10`| kubectl version. kubectl vesion can be found [here](https://github.com/kubernetes/kubernetes/releases)|
|`kustomize`|`false`|`5.0.0`| kustomize version. kustomize vesion can be found [here](https://github.com/kubernetes-sigs/kustomize/releases)|
|`helm`|`false`|`3.11.1`| helm version. helm vesion can be found [here](https://github.com/helm/helm/releases)|
|`kubeval`|`false`|`0.16.1`| kubeval version (must be **0.16.1+**). kubeval vesion can be found [here](https://github.com/instrumenta/kubeval/releases).<br> NOTE: this parameter is deprecating as `kubeval` is no longer maintained. A good replacement is [kubeconform](https://github.com/yannh/kubeconform). See also [this](https://github.com/instrumenta/kubeval) for more details.|
|`kubeconform`|`false`|`0.5.0`| kubeconform version. kubeconform vesion can be found [here](https://github.com/yannh/kubeconform/releases)|
|`conftest`|`false`|`0.39.0`| conftest version. conftest vesion can be found [here](https://github.com/open-policy-agent/conftest/releases)|
|`yq`|`false`|`4.30.7`| yq version. yq vesion can be found [here](https://github.com/mikefarah/yq/releases/)|
|`rancher`|`false`|`2.7.0`| Rancher CLI version. Rancher CLI vesion can be found [here](https://github.com/rancher/cli/releases)|
|`tilt`|`false`|`0.31.2`| Tilt version. Tilt vesion can be found [here](https://github.com/tilt-dev/tilt/releases)|
|`skaffold`|`false`|`2.1.0`| Skaffold version. Skaffold vesion can be found [here](https://github.com/GoogleContainerTools/skaffold/releases)|
|`kube-score`|`false`|`1.16.1`| kube-score version. kube-score vesion can be found [here](https://github.com/zegl/kube-score/releases)|

> - Supported Environments: Linux
> - From v0.7.0, the action supports tool version 'v' prefix. Prior to v0.7.0, the action only accept the tool version without 'v' prefix but from v0.7.0 the action automatically add/remove the prefix as necessary
> 
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

Specific versions for the commands can be setup by adding inputs parameters like this:

```yaml
  test: 
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: yokawasa/action-setup-kube-tools@v0.12.0
      with:
        kubectl: '1.25'
        kustomize: '5.0.0'
        helm: '3.11.1'
        kubeconform: '0.5.0'
        conftest: '0.39.0'
        rancher: '2.7.0'
        tilt: '0.31.2'
        skaffold: '2.1.0'
        kube-score: '1.16.1'
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
    - uses: actions/checkout@v2
    - uses: yokawasa/action-setup-kube-tools@v0.12.0
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
    - uses: actions/checkout@v2
    - uses: yokawasa/action-setup-kube-tools@v0.12.0
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

By specifying arch-type you can choose the processor architecture type of the tool binary to setup. Supported types are only `amd64`(default) and `arm64`.

```yaml
  test: 
    steps:
    - uses: actions/checkout@v4
    - uses: yokawasa/action-setup-kube-tools@v0.12.0
      with:
        arch-type: 'arm64'
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
git push origin releases/v0.12.0
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
