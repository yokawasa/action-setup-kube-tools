# Change Log

All notable changes to the "action-setup-kube-tools" will be documented in this file.

## v0.7.1
- fix: missing v prefix from kubeval and yq - [#16](https://github.com/yokawasa/action-setup-kube-tools/pull/16)
- changed default versions: yq v4.7.1, kubeval v0.16.1

## v0.7.0
- Add fail-fast parameter (fail-fast:true by default) that allows you to choose to fail fast immediately when it fails to download (say due to a bad version) - [#14](https://github.com/yokawasa/action-setup-kube-tools/issues/14)
- Support tool version 'v' prefix. Prior to this, the action only accept the tool version without 'v' prefix, but now the action automatically add/remove the prefix as necessary - [#13](https://github.com/yokawasa/action-setup-kube-tools/issues/13)

## v0.6.0
- add tools setup option to choose which tool to setup - [#8](https://github.com/yokawasa/action-setup-kube-tools/issues/8)
- up default tool versions
  - kubectl: 1.20.2
  - kustomize: 4.0.5
  - helm: 2.17.0
  - helmv3: 3.5.2

## v0.5.0

- Add kube-score - [#10](https://github.com/yokawasa/action-setup-kube-tools/pull/10)
  - https://github.com/zegl/kube-score

## v0.4.0

- Minor markdown cleanup
- Bump `actions/checkout` to v2 in tests and documentation
- Add Tilt and Skaffold - [#6](https://github.com/yokawasa/action-setup-kube-tools/pull/6)
  - https://tilt.dev
  - https://skaffold.dev

## v0.3.0

- Add Rancher CLI - [#4](https://github.com/yokawasa/action-setup-kube-tools/pull/4)
  - https://rancher.com/docs/rancher/v2.x/en/cli/

## v0.2.0

- Bumps @actions/core from 1.2.0 to 1.2.6 - [#2](https://github.com/yokawasa/action-setup-kube-tools/pull/2)

## v0.1.0

- Initial release

Default command versions:
- `kubectl`: `1.18.2`
- `kustomize`: `3.5.5`
- `helm`: `2.16.7`
- `helmv3`: `3.2.1`
- `kubeval`: `0.15.0`
- `conftest`: `0.19.0`
