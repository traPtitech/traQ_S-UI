export interface S {
  loaded: boolean
  componentLoaded: boolean
  initialFetchCompleted: boolean
}

export const state: S = {
  loaded: false,
  componentLoaded: false,
  initialFetchCompleted: false
}
