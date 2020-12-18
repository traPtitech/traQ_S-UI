import { StampPalette } from '@traptitech/traq'
import { StampPaletteId } from '@/types/entity-ids'
import {
  MessageMap,
  Undefinedable,
  FileMetaDataMap,
  TagMap,
  ClipFolderMap,
  StampMap,
  OgpDataMap
} from '.'

export type S = {
  messages: Undefinedable<MessageMap>
  stamps: Undefinedable<StampMap>
  stampPalettes: Record<StampPaletteId, StampPalette>
  fileMetaData: Undefinedable<FileMetaDataMap>
  tags: Undefinedable<TagMap>
  clipFolders: Undefinedable<ClipFolderMap>
  ogpData: Undefinedable<OgpDataMap>
}

export const state: S = {
  messages: {},
  stamps: {},
  stampPalettes: {},
  fileMetaData: {},
  tags: {},
  clipFolders: {},
  ogpData: {}
}
