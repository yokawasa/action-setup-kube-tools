<p align="center">
  <a href="https://github.com/yokawasa/action-setup-kube-tools/actions"><img alt="action-setup-kube-tools status" src="https://github.com/yokawasa/action-setup-kube-tools/workflows/build-test/badge.svg"></a>
</p>

# action-setup-kube-tools

A GitHub Action that install Kubernetes tools (kubectl, kustomize, helm, kubeval, conftest, yq) and cache them on the runner

## Usage

### Inputs

> Supported Environments: Linux

### Sample Workflow


## Developing the action

Install the dependencies  
```bash
npm install
```

Build the typescript and package it for distribution by running [ncc](https://github.com/zeit/ncc)
```bash
npm run build && npm run pack
```

Finally push the resutls
```
git add dist
git commit -a -m "prod dependencies"
git push origin releases/v0.1.0
```

## Contributing
Bug reports and pull requests are welcome on GitHub at https://github.com/yokawasa/action-setup-kube-tools
