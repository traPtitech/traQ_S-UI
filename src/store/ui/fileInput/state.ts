import { AttachmentType } from '@/lib/util/file'

export type Attachment = {
  file: File
  type: AttachmentType
  thumbnailDataUrl?: string
}

export interface S {
  attachments: Attachment[]
}

export const state: S = {
  attachments: []
}
