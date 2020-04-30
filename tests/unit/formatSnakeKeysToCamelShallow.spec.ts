/* eslint-disable @typescript-eslint/camelcase */
import { formatSnakeKeysToCamelShallow } from '@/lib/util/record'

describe('formatSnakeKeysToCamelShallow', () => {
  it('can format snake keys to camel keys', () => {
    const snakeData = {
      key: 'p',
      snake_data: 'o',
      p_O: 'po'
    }
    const camelData = {
      key: 'p',
      snakeData: 'o',
      pO: 'po'
    }

    const formatted = formatSnakeKeysToCamelShallow(snakeData)
    expect(formatted).toEqual(camelData)
  })
})
