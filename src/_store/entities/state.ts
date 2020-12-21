import { Undefinedable, OgpDataMap } from '.'

export type S = {
  ogpData: Undefinedable<OgpDataMap>
}

export const state: S = {
  ogpData: {}
}
