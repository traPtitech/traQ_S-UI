import { StampPalette } from '@traptitech/traq'
import { StampPaletteId } from '@/types/entity-ids'
import { MessageMap, Undefinedable, FileMetaDataMap, OgpDataMap } from '.'

export type S = {
  messages: Undefinedable<MessageMap>
  stampPalettes: Record<StampPaletteId, StampPalette>
  fileMetaData: Undefinedable<FileMetaDataMap>
  ogpData: Undefinedable<OgpDataMap>
}

export const state: S = {
  messages: {},
  stampPalettes: {},
  fileMetaData: {},
  ogpData: {}
}
