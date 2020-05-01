import { embeddingReplacer } from '@/lib/embeddingExtractor'

const basePath = `https://example.com`
const regexp = RegExp(
  `${basePath}/(files|messages)/([\\da-f]{8}-[\\da-f]{4}-[\\da-f]{4}-[\\da-f]{4}-[\\da-f]{12})(\\s*)`,
  'g'
)

const extractor = (message: string) => embeddingReplacer(message, regexp)

const id1 = 'e97518db-ebb8-450f-9b4a-273234e68491'
const id2 = 'd7461966-e5d3-4c6d-9538-7c8605f45a1e'
const path1 = `${basePath}/files/${id1}`
const path2 = `${basePath}/messages/${id2}`

describe('embeddingExtractor', () => {
  it('can extract a file from url', () => {
    const message = `${path1}`
    const result = extractor(message)
    expect(result).toEqual({
      text: '',
      embeddings: [
        {
          type: 'file',
          id: id1,
          startIndex: 0,
          endIndex: path1.length
        }
      ]
    })
  })

  it('can extract a file from text with url in middle of it', () => {
    const message = `file ${path1} is file`
    const replacedMessage = `file [[添付ファイル]] is file`
    const result = extractor(message)
    expect(result).toEqual({
      text: replacedMessage,
      embeddings: [
        {
          type: 'file',
          id: id1,
          startIndex: 5,
          endIndex: 5 + path1.length
        }
      ]
    })
  })

  it('can extract files from text with url in middle of it', () => {
    const message = `file ${path1} and ${path2} are file and message`
    const replacedMessage = `file [[添付ファイル]] and [[添付メッセージ]] are file and message`
    const result = extractor(message)
    expect(result).toEqual({
      text: replacedMessage,
      embeddings: [
        {
          type: 'file',
          id: id1,
          startIndex: 5,
          endIndex: 5 + path1.length
        },
        {
          type: 'message',
          id: id2,
          startIndex: 5 + path1.length + 5,
          endIndex: 5 + path1.length + 5 + path2.length
        }
      ]
    })
  })

  it('can extract a file from text with url at the end of it', () => {
    const noAttachMessage = 'attach!\n'
    const message = `${noAttachMessage}${path1}`
    const result = extractor(message)
    expect(result).toEqual({
      text: noAttachMessage,
      embeddings: [
        {
          type: 'file',
          id: id1,
          startIndex: noAttachMessage.length,
          endIndex: noAttachMessage.length + path1.length
        }
      ]
    })
  })
})
