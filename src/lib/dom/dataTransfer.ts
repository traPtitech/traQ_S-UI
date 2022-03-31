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

export const getTextOrFile = async (
  dt: DataTransfer
): Promise<string | File[] | null> => {
  const types = dt.types
  // iOS Safariでは存在しない
  if (!types) return null

  // chromeだとtext/uri-listならショートカットのファイルが含まれるので、
  // typeが指定されているファイルしか存在しないときはtext/uri-listを優先する
  // typeが指定されているファイルが存在する場合は、
  // 例えばブラウザ上の画像をドラッグドロップしたときに発生する
  if (types.includes('text/uri-list')) {
    const hasOnlyNonTypedFiles = [...dt.files].every(file => file.type === '')

    if (hasOnlyNonTypedFiles) {
      const url = dt.getData('text/uri-list')

      // もし、ファイル数が1件ならショートカットファイルから名前を抽出して利用する
      if (dt.files.length === 1 && dt.files[0]?.name) {
        const name = dt.files[0].name.replace(/\.url$/, '')
        return `[${name}](${url})`
      }
      return url
    }
  }

  if (types.includes('Files')) {
    return [...dt.files]
  }

  if (types.includes('text/html')) {
    const text = await getTextFromHtml(dt)
    return text
  }

  if (types.includes('text/plain')) {
    return dt.getData('text/plain')
  }

  return null
}
