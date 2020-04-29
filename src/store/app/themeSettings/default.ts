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
    primary: '#4899F9',
    notification: '#F2994A',
    online: '#28F0E4',
    error: '#F26451'
  },
  background: {
    primary: '#242B33',
    secondary: '#1E262E',
    tertiary: '#1A242D',
    secondarySub: '#1E262F'
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
