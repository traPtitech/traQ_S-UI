# Markdown packages

These archives contain the Rust/Wasm SDK and TypeScript renderers from the commits in [provenance.json](provenance.json). They are installed through local file dependencies so this branch builds before the packages are published to npm. Each archive includes its license and, where applicable, third-party notices.

To regenerate, check out the four repositories at the recorded commits in sibling directories, install and build their packages, then run `npm pack --ignore-scripts --pack-destination /path/to/traQ_S-UI/vendor/markdown` in each repository. Update the hashes and install the four archive paths with `npm install` to refresh package-lock.json.
