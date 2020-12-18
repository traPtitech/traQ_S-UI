import { MessageMap, Undefinedable, FileMetaDataMap, OgpDataMap } from '.'

export type S = {
  messages: Undefinedable<MessageMap>
  fileMetaData: Undefinedable<FileMetaDataMap>
  ogpData: Undefinedable<OgpDataMap>
}

export const state: S = {
  messages: {},
  fileMetaData: {},
  ogpData: {}
}
