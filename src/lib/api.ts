import { Apis } from '@traptitech/traq'

const apis = new Apis({
  basePath: '/api/v3'
})

export * from '@traptitech/traq'
export default apis

export const WEBSOCKET_ENDPOINT = '/api/v3/ws'
