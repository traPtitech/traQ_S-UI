# traQ-S_UI - traP Internal Messenger Application

[![GitHub release](https://img.shields.io/github/release/traPtitech/traQ_S-UI.svg)](https://GitHub.com/traPtitech/traQ_S-UI/releases/)
![CI](https://github.com/traPtitech/traQ_S-UI/workflows/CI/badge.svg)
![release](https://github.com/traPtitech/traQ_S-UI/workflows/release/badge.svg)
[![codecov](https://codecov.io/gh/traPtitech/traQ_S-UI/branch/master/graph/badge.svg)](https://codecov.io/gh/traPtitech/traQ_S-UI)

- Backend: [traQ](https://github.com/traPtitech/traQ)
- Frontend: this repository

traQ (pronounced "track") is a messenger application built for [Digital Creators Club traP](https://trap.jp).
traQ allows ease communication among team members by organizing contexts into tree-structured channels.

![traQ](https://user-images.githubusercontent.com/49056869/115141831-5a376980-a079-11eb-93c1-7016bc2097d0.png)

## Deployment

### Using Docker

When deploying using Docker, you can mount `config.json` externally:

```bash
docker run -d \
  -p 80:80 \
  -v /path/to/your/config.json:/app/override/config.json \
  traq-ui:latest
```

See [`config.json` in the manifest repository](https://github.com/traPtitech/manifest/blob/main/traq/frontend/config.json) for an example.
You can also mount a `config.js` file at `/app/override/config.js` instead for backward compatibility, and it will be automatically converted to `config.js` at runtime.
Please note that if both `config.js` and `config.json` are mounted, `config.js` will be ignored and overwritten by the mapped `config.json`.

Refer to [`config.d.ts`](./config.d.ts) for the TypeScript type definition and [`config.schema.json`](./config.schema.json) for the JSON Schema.

### Other Deployment Methods

If you want to deploy your own instance of traQ, then follow the instructions in backend [deployment.md](https://github.com/traPtitech/traQ/blob/master/docs/deployment.md).

## Development

If you want to contribute to traQ (Frontend), then follow the instructions in [development.md](./docs/development.md).

## License

Code licensed under [the MIT License](https://github.com/traPtitech/traQ_S-UI/blob/master/LICENSE).
