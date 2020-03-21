import { Apis } from '@traptitech/traq'

export const BASE_PATH = '/api/v3'
export const WEBSOCKET_ENDPOINT = '/api/v3/ws'

const apis = new Apis({
  basePath: BASE_PATH
})

export * from '@traptitech/traq'
export default apis
