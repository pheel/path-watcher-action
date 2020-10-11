## path-watcher-action

Given a comma-separated list of globs, returns whether the head commit that triggered the action involves a change in any of the input paths.

Usage:

```yaml
on: [push]

jobs:
  job:
    runs-on: ubuntu-latest
    steps:
      - id: modified
        uses: pheel/path-watcher-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }} # no need to set this secret, it is always available!
          paths: 'dir1/**/*,dir2/**/*'
          return_files: true # if true, return an array of the modified paths. defaults to false.
      - if: steps.modified.outputs.modified
        run: echo "Hey some change happened in one of your watched paths!"
```
