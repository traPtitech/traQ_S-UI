export const frontendOrigin = 'http://127.0.0.1:4173'

export const getBackendOrigin = () => {
  const value = process.env['E2E_BACKEND_URL']
  if (!value) {
    throw new Error('Start the isolated E2E environment with npm run test:e2e')
  }

  const url = new URL(value)
  if (
    url.protocol !== 'http:' ||
    url.hostname !== '127.0.0.1' ||
    !url.port ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('E2E_BACKEND_URL must be an HTTP origin on 127.0.0.1')
  }
  return url.origin
}
