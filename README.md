# setup-steam-depot-downloader

Action to setup Steam depot downloader

## Usage

```yaml
- name: Setup Steam depot downloader
  uses: Axwabo/setup-steam-depot-downloader@v1
  with:
    version: 'latest' # Optional. This is a release tag. Default is 'latest'
    test: 'false' # Optional. Skips testing the tool. Default is 'true'
```