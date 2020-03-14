import { Apis as V3Apis } from 'traq-api-v3'

const apis = new V3Apis({
  basePath: '/api/v3'
})

export * from 'traq-api-v3'
export default apis

export const WEBSOCKET_ENDPOINT = '/api/1.0/ws'

export enum ChannelViewerStateEnum {
  VIEWSTATE_NONE = 'none',
  VIEWSTATE_MONITORING = 'monitoring',
  VIEWSTATE_EDITING = 'editing'
}
