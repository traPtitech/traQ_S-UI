import { MyUserDetail } from '@traptitech/traq'

export interface S {
  detail?: Readonly<MyUserDetail>
}

export const state: S = {
  detail: undefined
}
