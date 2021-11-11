// @ts-check
;(() => {
  /**
   * @type {import('../src/types/theme').Theme}
   */
  const lightTheme = {
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

  /**
   * @type {import('../src/types/theme').Theme}
   */
  const darkTheme = {
    accent: {
      primary: '#4899F9',
      notification: '#F2994A',
      online: '#28F0E4',
      error: '#F26451',
      focus: '#4899F9C0'
    },
    background: {
      primary: '#242B33',
      secondary: '#1E262E',
      tertiary: '#1A242D'
    },
    ui: {
      primary: '#F2F5F8',
      secondary: '#C7D0D9',
      tertiary: '#8795A3'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#BAC2C9'
    }
  }

  window.defaultLightTheme = lightTheme
  window.defaultDarkTheme = darkTheme
})()
