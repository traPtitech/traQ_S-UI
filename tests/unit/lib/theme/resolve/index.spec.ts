import { resolveTheme } from '/@/lib/theme/resolve'

describe('resolveTheme', () => {
  const input = {
    version: 2,
    basic: {
      accent: {
        primary: '#005BAC',
        notification: '#F2994A',
        online: '#28F0E4',
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
      scrollbarThumb: 'rgba(107, 125, 138, 0.5)',
      scrollbarThumbHover: 'rgba(107, 125, 138, 0.8)',
      scrollbarTrack: 'transparent',
      themeColor: '#005BAC'
    }
    expect(actual.browser).toStrictEqual(expected)
  })
})
