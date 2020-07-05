export const blobAsArrayBuffer = (
  blob: Readonly<Blob>
): Promise<ArrayBuffer> => {
  if (blob.arrayBuffer) {
    return blob.arrayBuffer()
  }

  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.addEventListener('load', () => {
      resolve(reader.result as ArrayBuffer)
    })
    reader.addEventListener('error', () => {
      reject()
    })

    reader.readAsArrayBuffer(blob)
  })
}
