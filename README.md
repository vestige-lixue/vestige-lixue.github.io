# vestige-lixue.github.io

The website of [Vestige](https://github.com/vestige-lixue/vestige), built with VitePress.

The user guide is not kept here. `pnpm sync` copies it from `resources/docs/` in the vestige repository into `guide/` and `zh-cn/guide/` (both git-ignored), rewriting the links between guide files.

```shell
pnpm install
pnpm sync                      # the guide from the latest release
pnpm sync --ref main           # or from a tag, branch or commit
pnpm sync --source ../vestige  # or from a local checkout
pnpm dev
```

Pushing to `main` deploys the site to GitHub Pages with the guide from the latest release. The workflow can also be run by hand with a ref, or triggered from the vestige repository with a `release` repository dispatch whose `client_payload.ref` names the tag.