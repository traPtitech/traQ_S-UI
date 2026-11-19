import { getBackendOrigin } from '../../e2e/config'

describe('E2E backend origin', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('requires the isolated environment to supply a backend', () => {
    vi.stubEnv('E2E_BACKEND_URL', undefined)
    expect(getBackendOrigin).toThrow('npm run test:e2e')
  })

  it('accepts the dynamically published local backend port', () => {
    vi.stubEnv('E2E_BACKEND_URL', 'http://127.0.0.1:49152/')
    expect(getBackendOrigin()).toBe('http://127.0.0.1:49152')
  })

  it.each([
    'https://q-dev.trapti.tech',
    'http://example.com:3000',
    'https://127.0.0.1:3000',
    'http://127.0.0.1',
    'http://user:password@127.0.0.1:3000',
    'http://127.0.0.1:3000/api/v3',
    'http://127.0.0.1:3000/?target=dev',
    'http://127.0.0.1:3000/#dev'
  ])('rejects an unexpected backend URL: %s', url => {
    vi.stubEnv('E2E_BACKEND_URL', url)
    expect(getBackendOrigin).toThrow('127.0.0.1')
  })
})
