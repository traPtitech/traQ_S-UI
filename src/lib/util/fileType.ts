export type AttachmentType = 'image' | 'audio' | 'video' | 'file'

export const parseFileType = (fileType: string): AttachmentType => {
  if (fileType.startsWith('image/')) {
    return 'image'
  }
  if (fileType.startsWith('audio/')) {
    return 'audio'
  }
  if (fileType.startsWith('video/')) {
    return 'video'
  }
  return 'file'
}

export const isImage = (fileType: string) => parseFileType(fileType) === 'image'
export const isVideo = (fileType: string) => parseFileType(fileType) === 'video'
export const isAudio = (fileType: string) => parseFileType(fileType) === 'audio'
export const isNonPreviewable = (fileType: string) => {
  const type = parseFileType(fileType)
  return type === 'file' || type === 'audio'
}
