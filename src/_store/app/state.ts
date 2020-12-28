import { Version } from '@traptitech/traq'

export interface S {
  loginCheckSucceeded: boolean
  initialFetchCompleted: boolean
  version: Readonly<Version>
}

export const state: S = {
  loginCheckSucceeded: false,
  initialFetchCompleted: false,
  version: {
    version: '',
    revision: '',
    flags: {
      externalLogin: []
    }
  }
}
