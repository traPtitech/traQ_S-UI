import { Theme } from '@/types/theme'

export const lightTheme: Theme = {
  accent: {
    primary: '#005BAC',
    notification: '#F2994A',
    online: '#28F0E4',
    error: '#F26451'
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F6F7F9',
    tertiary: '#ECEFF3',
    secondarySub: '#FBFCFE'
  },
  ui: {
    primary: '#525E67',
    secondary: '#828E96',
    tertiary: '#CED6DB'
  },
  text: {
    primary: '#333333',
    secondary: '#79797A'
  }
}

export const darkTheme: Theme = {
  accent: {
    primary: '#60A7DC',
    notification: '#F2994A',
    online: '#28F0E4',
    error: '#F26451'
  },
  background: {
    primary: '#252B32',
    secondary: '#22282F',
    tertiary: '#1E262E',
    secondarySub: '#2A3038'
  },
  ui: {
    primary: '#D7E0E7',
    secondary: '#7E8D99',
    tertiary: '#53636F'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#BAC2C9'
  }
}
