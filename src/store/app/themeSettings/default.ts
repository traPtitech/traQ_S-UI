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
    primary: '#005BAC',
    notification: '#F2994A',
    online: '#28F0E4',
    error: '#F26451'
  },
  background: {
    primary: '#222426',
    secondary: '#2D2F31',
    tertiary: '#56636E',
    secondarySub: '#3C4246'
  },
  ui: {
    primary: '#CACFD3',
    secondary: '#758087',
    tertiary: '#59656F'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#BAC2C9'
  }
}
