export const setupMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vitest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vitest.fn(),
      removeEventListener: vitest.fn(),
      dispatchEvent: vitest.fn()
    }))
  })
}

setupMatchMedia()
