type imgSize = {
  width: number
  height: number
}
export const imageSize = async (file: File): Promise<imgSize> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const size = {
        width: img.naturalWidth,
        height: img.naturalHeight
      }
      URL.revokeObjectURL(img.src)
      resolve(size)
    }
    img.onerror = error => {
      reject(error)
    }
    img.src = URL.createObjectURL(file)
  })
}
