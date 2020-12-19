import { Undefinedable, FileMetaDataMap, OgpDataMap } from '.'

export type S = {
  fileMetaData: Undefinedable<FileMetaDataMap>
  ogpData: Undefinedable<OgpDataMap>
}

export const state: S = {
  fileMetaData: {},
  ogpData: {}
}
