import { Theme, themeSchema } from '/@/lib/theme/schema'

describe('themeSchema', () => {
  it('should parse basic', () => {
    const input: Theme = {
      version: 2,
      basic: {
        accent: {
          primary: '#005BAC', // upper case
          notification: '#f2994a', // lower case
          online: '#28f0E4', // mixed case
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
    }
    const actual = themeSchema.parse(input)
    expect(actual).toStrictEqual(input)
  })
})
