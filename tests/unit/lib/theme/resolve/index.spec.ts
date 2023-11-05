import { resolveTheme } from '/@/lib/theme/resolve'

describe('resolveTheme', () => {
  const input = {
    version: 2,
    basic: {
      accent: {
        primary: '#005BAC',
        notification: '#F2994A',
        online: '#02D931',
        error: '#F26451',
        focus: '#005BACC0'
      },
      background: {
        primary: '#FFFFFF',
        secondary: '#F0F2F5',
        tertiary: '#E2E5E9'
      },
      ui: {
        primary: '#49535B',
        secondary: '#6B7D8A',
        tertiary: '#CED6DB'
      },
      text: {
        primary: '#333333',
        secondary: '#79797A'
      }
    }
  } as const

  test('can resolve specific', () => {
    const actual = resolveTheme(input)
    const expected = {
      waveformColor: '#005BAC',
      waveformGradation:
        'repeating-linear-gradient(90deg, #ccc, #333, #ccc 25%)',
      navigationBarDesktopBackground: '#F0F2F5',
      navigationBarMobileBackground: '#E2E5E9',
      mainViewBackground: '#FFFFFF',
      sideBarBackground: '#F0F2F5',
      stampEdgeEnable: false,
      channelHashOpened: '#F0F2F5',
      channelUnreadBadgeText: '#F0F2F5',
      loadingSpinnerGapUiSecondary: 'rgba(107, 125, 138, 0.5)',
      messageHoverBackground: 'rgba(240, 242, 245, 0.5)',
      sliderBackground: 'rgba(107, 125, 138, 0.5)',
      stampCountText: 'rgba(73, 83, 91, 0.6)',
      stampIncludeMeBackground: 'rgba(0, 91, 172, 0.3)',
      stampPickerOpenerBorder: 'rgba(73, 83, 91, 0.6)'
    }
    expect(actual.specific).toStrictEqual(expected)
  })

  test('can resolve browser', () => {
    const actual = resolveTheme(input)
    const expected = {
      themeColor: '#005BAC',
      colorScheme: 'light',

      selectionText: '#FFFFFF',
      selectionBackground: 'rgba(0, 91, 172, 0.5)',
      caret: undefined,

      scrollbarThumb: 'rgba(107, 125, 138, 0.5)',
      scrollbarThumbHover: 'rgba(107, 125, 138, 0.8)',
      scrollbarTrack: 'transparent'
    }
    expect(actual.browser).toStrictEqual(expected)
  })
})
