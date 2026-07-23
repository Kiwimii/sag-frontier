# Browser preview

The repository builds a real Godot Web export through GitHub Actions.

## Build

The `Browser Preview` workflow:

1. installs a pinned Godot release and matching export templates,
2. imports the project headlessly,
3. exports the `Web` preset,
4. verifies that HTML, WebAssembly and PCK files exist,
5. uploads the result as `sag-frontier-browser-preview`.

## Test the artifact

Download the workflow artifact, unzip it and serve the folder through a local HTTP server. Godot Web exports must not be opened through `file://`.

Example:

```bash
python -m http.server 8080 --directory browser-preview
```

Then open `http://localhost:8080`.

## Public preview URL

A permanent browser URL will use GitHub Pages after the foundation changes are on the default branch and Pages is enabled for GitHub Actions in the repository settings. Until then, the workflow artifact is the verified browser build.
