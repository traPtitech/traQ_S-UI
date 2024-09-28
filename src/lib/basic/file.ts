import type { FileInfo } from '@traptitech/traq'
import { ThumbnailType } from '@traptitech/traq'

export type AttachmentType =
  | 'image'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'slide'
  | 'file'

const PDF_MIME = 'application/pdf'
const SLIDE_MIMES: ReadonlySet<string> = new Set([
  /* microsoft powerpoint */ 'application/vnd.ms-powerpoint',
  /* microsoft powerpoint */ 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  /* libreoffice impress */ 'application/vnd.sun.xml.impress',
  /* apple keynote */ 'application/vnd.apple.keynote'
])

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
  if (mime === PDF_MIME) {
    return 'pdf'
  }
  if (SLIDE_MIMES.has(mime)) {
    return 'slide'
  }
  return 'file'
}

export const isImage = (mime: string) => mimeToFileType(mime) === 'image'
export const isVideo = (mime: string) => mimeToFileType(mime) === 'video'
export const isAudio = (mime: string) => mimeToFileType(mime) === 'audio'
export const isNonPreviewable = (
  meta: Readonly<Pick<FileInfo, 'mime' | 'thumbnails'>>
) => {
  const type = mimeToFileType(meta.mime)
  if (type === 'file' || type === 'pdf' || type === 'slide') {
    return true
  }
  const thumbnailExists = meta.thumbnails.some(
    t => t.type === ThumbnailType.Image
  )
  if (type === 'image' && !thumbnailExists && meta.mime !== 'image/svg+xml') {
    return true
  }
  return false
}

const sizePrefix = ['', 'K', 'M', 'G']

/** byteを適当にKBなどに直す */
export const prettifyFileSize = (byte: number) => {
  const s = byte ? Math.floor(Math.log10(byte) / 3) : 0
  return `${Math.round((byte / 1000 ** s) * 100) / 100}${sizePrefix[s]}B`
}
