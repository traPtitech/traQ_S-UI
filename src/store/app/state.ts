import { Version } from '@traptitech/traq'

export interface S {
  loaded: boolean
  componentLoaded: boolean
  initialFetchCompleted: boolean
  version: Readonly<Version>
}

export const state: S = {
  loaded: false,
  componentLoaded: false,
  initialFetchCompleted: false,
  version: {
    version: '',
    revision: '',
    flags: {
      externalLogin: []
    }
  }
}
