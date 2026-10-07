describe('shouldAutoFocus', () => {
  const touchEndDescriptor = Object.getOwnPropertyDescriptor(
    document,
    'ontouchend'
  )

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (touchEndDescriptor) {
      Object.defineProperty(document, 'ontouchend', touchEndDescriptor)
    } else {
      Reflect.deleteProperty(document, 'ontouchend')
    }
  })

  it.each([
    ['desktop mouse', 'Windows NT 10.0', true, false, true],
    ['narrow desktop', 'Windows NT 10.0', true, true, true],
    ['wide touch PC', 'Windows NT 10.0', false, false, false],
    ['iPad', 'iPad', false, false, false],
    ['iPad with mouse', 'iPad', true, false, false],
    ['Android with mouse', 'Android', true, false, false],
    ['iPad desktop UA', 'Macintosh', true, false, false]
  ] as const)(
    'applies the autofocus policy on %s',
    async (_, ua, hover, narrow, expected) => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ua)
      if (ua === 'Macintosh') {
        Object.defineProperty(document, 'ontouchend', {
          value: null,
          configurable: true
        })
      }
      vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
        media: query,
        matches:
          query === '(hover: hover) and (pointer: fine)' ? hover : narrow,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
      const { shouldAutoFocus } = await import('/@/lib/dom/browser')

      expect(shouldAutoFocus()).toBe(expected)
    }
  )
})
