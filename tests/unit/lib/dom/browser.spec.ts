describe('shouldAutoFocus', () => {
  const touchPointsDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'maxTouchPoints'
  )

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (touchPointsDescriptor) {
      Object.defineProperty(navigator, 'maxTouchPoints', touchPointsDescriptor)
    } else {
      Reflect.deleteProperty(navigator, 'maxTouchPoints')
    }
  })

  it.each([
    ['desktop mouse', 'Windows NT 10.0', true, false, 0, true],
    ['narrow desktop', 'Windows NT 10.0', true, true, 0, true],
    ['wide touch PC', 'Windows NT 10.0', false, false, 5, false],
    ['iPad', 'iPad', false, false, 5, false],
    ['iPad with mouse', 'iPad', true, false, 5, false],
    ['Android with mouse', 'Android', true, false, 5, false],
    ['iPad desktop UA', 'Macintosh', true, false, 5, false],
    ['Mac', 'Macintosh', true, false, 0, true]
  ] as const)(
    'applies the autofocus policy on %s',
    async (_, ua, hover, narrow, maxTouchPoints, expected) => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ua)
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: maxTouchPoints,
        configurable: true
      })
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
