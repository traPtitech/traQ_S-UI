import useResponsiveWithoutSetup from '/@/composables/useResponsive'

import { withSetup } from '../testUtils'

const useResponsive = withSetup(useResponsiveWithoutSetup)
const hoverQuery = '(hover: hover) and (pointer: fine)'

const createQuery = (media: string, matches: boolean): MediaQueryList =>
  Object.assign(new EventTarget(), {
    media,
    matches,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn()
  })

const changeMatches = (query: MediaQueryList, matches: boolean) => {
  Object.defineProperty(query, 'matches', {
    value: matches,
    configurable: true
  })
  query.dispatchEvent(Object.assign(new Event('change'), { matches }))
}

describe('useResponsive', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([true, false])(
    'updates touch detection when hover support initially is %s',
    hoverSupported => {
      const hover = createQuery(hoverQuery, hoverSupported)
      const width = createQuery('(max-width: 576px)', false)
      vi.spyOn(window, 'matchMedia').mockImplementation(query =>
        query === hoverQuery ? hover : width
      )
      const [{ isMobile, isTouchDevice }, { unmount }] = useResponsive()

      expect(isTouchDevice.value).toBe(!hoverSupported)
      changeMatches(hover, !hoverSupported)
      expect(isTouchDevice.value).toBe(hoverSupported)
      changeMatches(hover, hoverSupported)
      expect(isTouchDevice.value).toBe(!hoverSupported)
      expect(isMobile.value).toBe(false)

      unmount()
    }
  )

  it('updates the viewport width without changing touch detection', () => {
    const hover = createQuery(hoverQuery, true)
    const width = createQuery('(max-width: 576px)', false)
    vi.spyOn(window, 'matchMedia').mockImplementation(query =>
      query === hoverQuery ? hover : width
    )
    const [{ isMobile, isTouchDevice }, { unmount }] = useResponsive()

    changeMatches(width, true)
    expect(isMobile.value).toBe(true)
    expect(isTouchDevice.value).toBe(false)
    changeMatches(width, false)
    expect(isMobile.value).toBe(false)
    expect(isTouchDevice.value).toBe(false)

    unmount()
  })
})
