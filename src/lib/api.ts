import { Apis as V3Apis } from 'traq-api-v2'

const apis = new V3Apis({
  basePath: '/api/1.0'
})

export * from 'traq-api-v2'
export default apis

export const WEBSOCKET_ENDPOINT = '/api/1.0/ws'
