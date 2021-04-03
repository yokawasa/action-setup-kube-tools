<p align="center">
  <a href="https://github.com/yokawasa/action-setup-kube-tools/actions"><img alt="action-setup-kube-tools status" src="https://github.com/yokawasa/action-setup-kube-tools/workflows/build-test/badge.svg"></a>
</p>

# action-setup-kube-tools
A GitHub Action that setup Kubernetes tools (kubectl, kustomize, helm, kubeval, conftest, yq, rancher, tilt, skaffold, kube-score) and cache them on the runner. It is like a typescript version of [stefanprodan/kube-tools](https://github.com/stefanprodan/kube-tools) with no command input param, but as compared with [it](https://github.com/stefanprodan/kube-tools), it's **very fast** as it installs the tools asynchronously.

## Usage

### Inputs

|Parameter|Required|Default Value|Description|
|:--:|:--:|:--:|:--|
|`kubectl`|`false`|`1.18.2`| kubectl version. kubectl vesion can be found [here](https://github.com/kubernetes/kubernetes/releases)|
|`kustomize`|`false`|`3.5.5`| kustomize version. kustomize vesion can be found [here](https://github.com/kubernetes-sigs/kustomize/releases)|
|`helm`|`false`|`2.16.7`| helm version. helm vesion can be found [here](https://github.com/helm/helm/releases)|
|`helmv3`|`false`|`3.2.1`| helm v3 version. helm v3 vesion can be found [here](https://github.com/helm/helm/releases)|
|`kubeval`|`false`|`0.15.0`| kubeval version. kubeval vesion can be found [here](https://github.com/instrumenta/kubeval/releases)|
|`conftest`|`false`|`0.19.0`| conftest version. conftest vesion can be found [here](https://github.com/open-policy-agent/conftest/releases)|
|`rancher`|`false`|`2.4.10`| Rancher CLI version. Rancher CLI vesion can be found [here](https://github.com/rancher/cli/releases)|
|`tilt`|`false`|`0.18.11`| Tilt version. Tilt vesion can be found [here](https://github.com/tilt-dev/tilt/releases)|
|`skaffold`|`false`|`1.20.0`| Skaffold version. Skaffold vesion can be found [here](https://github.com/GoogleContainerTools/skaffold/releases)|
|`kube-score`|`false`|`1.10.1`| kube-score version. kube-score vesion can be found [here](https://github.com/zegl/kube-score/releases)|

> Supported Environments: Linux

### Outputs
|Parameter|Description|
|:--:|:--|
|`kubectl-path`| kubectl command path |
|`kustomize-path`| kustomize command path |
|`helm-path`| helm command path |
|`helmv3-path`| helm v3 command path |
|`kubeval-path`| kubeval command path |
|`conftest-path`| conftest command path |
|`yq-path`| yq command path |
|`rancher-path`| rancher command path |
|`tilt-path`| rancher command path |
|`skaffold-path`| rancher command path |
|`kube-score-path:`| rancher command path |

### Sample Workflow

Specific versions for the commands can be setup by adding inputs parameters like this:

```yaml
  test: 
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: yokawasa/action-setup-kube-tools@v0.5.0
      with:
        kubectl: '1.17.1'
        kustomize: '3.7.0'
        helm: '2.16.7'
        helmv3: '3.2.4'
        kubeval: '0.14.0'
        conftest: '0.18.2'
        rancher: '2.4.10'
        tilt: '0.18.11'
        skaffold: '1.20.0'
        kube-score: '1.10.1'
      id: setup
    - run: |
        kubectl version --client
        kustomize version
        helm version --client
        helmv3 version
        kubeval --version
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
    - uses: yokawasa/action-setup-kube-tools@v0.5.0
      id: setup
    - run: |
        kubectl version --client
        kustomize version
        helm version --client
        helmv3 version
        kubeval --version
        conftest --version
        yq --version
        rancher --version
        tilt version
        skaffold version
        kube-score version
```


## Developing the action

Install the dependencies  
```bash
npm install
```

Build the typescript and package it for distribution by running [ncc](https://github.com/zeit/ncc)
```bash
npm run build && npm run pack
```

Finally push the results
```
git add dist
git commit -a -m "prod dependencies"
git push origin releases/v0.5.0
```

## Contributing
Bug reports and pull requests are welcome on GitHub at https://github.com/yokawasa/action-setup-kube-tools
