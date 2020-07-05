import { FileInfo } from '@traptitech/traq'

export type AttachmentType = 'image' | 'audio' | 'video' | 'file'

export const mimeToFileType = (mime: string): AttachmentType => {
  if (mime.startsWith('image/')) {
    return 'image'
  }
  if (mime.startsWith('audio/')) {
    return 'audio'
  }
  if (mime.startsWith('video/')) {
    return 'video'
  }
  return 'file'
}

export const isImage = (mime: string) => mimeToFileType(mime) === 'image'
export const isVideo = (mime: string) => mimeToFileType(mime) === 'video'
export const isAudio = (mime: string) => mimeToFileType(mime) === 'audio'
export const isNonPreviewable = (
  meta: Readonly<Pick<FileInfo, 'mime' | 'thumbnail'>>
) => {
  const type = mimeToFileType(meta.mime)
  if (type === 'file') {
    return true
  }
  if (type === 'image' && !meta.thumbnail && meta.mime !== 'image/svg+xml') {
    return true
  }
  return false
}

const sizePrefix = ['', 'K', 'M', 'G']

/** byteを適当にKBなどに直す */
export const prettifyFileSize = (byte: number) => {
  const s = Math.floor(Math.log10(byte) / 3)
  return `${Math.round((byte / 1000 ** s) * 100) / 100}${sizePrefix[s]}B`
}
