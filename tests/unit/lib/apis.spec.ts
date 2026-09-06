import { getServerRequestUrl } from '/@/lib/apis'

describe('getServerRequestUrl', () => {
  it('returns a same-origin OAuth authorization URL as a relative URL', () => {
    const url = new URL(
      '/api/v3/oauth2/authorize?client_id=test#fragment',
      location.origin
    )

    expect(getServerRequestUrl(url.href)).toBe(
      '/api/v3/oauth2/authorize?client_id=test#fragment'
    )
  })

  it.each([
    'https://example.com/api/v3/oauth2/authorize',
    'javascript:alert(1)',
    '/channels/general'
  ])('rejects %s', url => {
    expect(getServerRequestUrl(url)).toBeUndefined()
  })
})
