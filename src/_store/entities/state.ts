import { StampPalette } from '@traptitech/traq'
import { StampPaletteId } from '@/types/entity-ids'
import {
  MessageMap,
  Undefinedable,
  WebhookMap,
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
  webhooks: Undefinedable<WebhookMap>
  fileMetaData: Undefinedable<FileMetaDataMap>
  tags: Undefinedable<TagMap>
  clipFolders: Undefinedable<ClipFolderMap>
  ogpData: Undefinedable<OgpDataMap>
}

export const state: S = {
  messages: {},
  stamps: {},
  stampPalettes: {},
  webhooks: {},
  fileMetaData: {},
  tags: {},
  clipFolders: {},
  ogpData: {}
}
