# Change Log

All notable changes to the "action-setup-kube-tools" will be documented in this file.

## v0.6.0
- add tools setup option to choose which tool to setup - [Issue#8](https://github.com/yokawasa/action-setup-kube-tools/issues/8)
- up default tool versions
  - kubectl: 1.20.2
  - kustomize: 4.0.5
  - helm: 2.17.0
  - helmv3: 3.5.2

## v0.5.0

- Add kube-score - [PR#10](https://github.com/yokawasa/action-setup-kube-tools/pull/10)
  - https://github.com/zegl/kube-score

## v0.4.0

- Minor markdown cleanup
- Bump `actions/checkout` to v2 in tests and documentation
- Add Tilt and Skaffold - [PR#6](https://github.com/yokawasa/action-setup-kube-tools/pull/6)
  - https://tilt.dev
  - https://skaffold.dev

## v0.3.0

- Add Rancher CLI - [PR#4](https://github.com/yokawasa/action-setup-kube-tools/pull/4)
  - https://rancher.com/docs/rancher/v2.x/en/cli/

## v0.2.0

- Bumps @actions/core from 1.2.0 to 1.2.6 - [PR#2](https://github.com/yokawasa/action-setup-kube-tools/pull/2)

## v0.1.0

- Initial release

Default command versions:
- `kubectl`: `1.18.2`
- `kustomize`: `3.5.5`
- `helm`: `2.16.7`
- `helmv3`: `3.2.1`
- `kubeval`: `0.15.0`
- `conftest`: `0.19.0`
