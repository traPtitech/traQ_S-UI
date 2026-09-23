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

When deploying using Docker, mount a JavaScript configuration file at `/app/override/config.js`:

```bash
docker run -d \
  -p 80:80 \
  -v /path/to/your/config.js:/app/override/config.js:ro \
  ghcr.io/traptitech/traq-ui:master
```

See [`public/config.js`](./public/config.js) for a minimal example.
Deployments managed by the [manifest repository](https://github.com/traPtitech/manifest/blob/main/traq/frontend/config.jsonc) keep the source configuration as `config.jsonc`; their init container converts it to `config.js` before mounting it into this image.

Refer to [`config.d.ts`](./config.d.ts) for the TypeScript type definition and [`config.schema.json`](./config.schema.json) for the JSON Schema.

### Other Deployment Methods

If you want to deploy your own instance of traQ, then follow the instructions in backend [deployment.md](https://github.com/traPtitech/traQ/blob/master/docs/deployment.md).

## Development

If you want to contribute to traQ (Frontend), please read the [contribution guidelines](./CONTRIBUTING.md) and follow the [development guide](./docs/development.md).

## License

Code licensed under [the MIT License](https://github.com/traPtitech/traQ_S-UI/blob/master/LICENSE).
