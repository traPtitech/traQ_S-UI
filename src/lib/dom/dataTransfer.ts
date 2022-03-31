import { generateMarkdownFromHtml } from '/@/lib/markdown/fromHtml'

const removeSpaces = (text: string) => text.replace(/\s|\\/g, '')

export const getTextFromHtml = async (dt: DataTransfer) => {
  const html = dt.getData('text/html')
  const plainText = dt.getData('text/plain')
  const markdown = await generateMarkdownFromHtml(html)

  const isSame = removeSpaces(markdown) === removeSpaces(plainText)
  if (isSame) {
    return plainText
  }

  if (confirm('HTMLをマークダウンに変換して貼り付けますか？')) {
    return markdown
  }
  return plainText
}
