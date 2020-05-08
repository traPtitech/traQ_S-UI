export const convertToDataUrl = (file: File): Promise<string | null> => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  return new Promise(resolve => {
    reader.addEventListener(
      'load',
      event => {
        // `readAsDataURL`を用いるため、結果の型はstring
        // see: https://developer.mozilla.org/ja/docs/Web/API/FileReader/result
        const thumbnailDataUrl = event.target?.result as string | null
        resolve(thumbnailDataUrl)
      },
      { once: true }
    )
  })
}
