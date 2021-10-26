import { convertToDataUrl } from '/@/lib/resize/dataurl'
import fs from 'fs/promises'
import path from 'path'

const loadDummyGif = async () => {
  const dummyGifPath = path.resolve(__dirname, './1.gif')
  const dummyGif = await fs.readFile(dummyGifPath)
  return new File([dummyGif.buffer], '1.gif', { type: 'image/gif' })
}

const dummyGifExpected =
  'data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7'

describe('convertToDataUrl', () => {
  it('can convert', async () => {
    const dummyGif = await loadDummyGif()

    const actual = await convertToDataUrl(dummyGif)
    expect(actual).toBe(dummyGifExpected)
  })
})
