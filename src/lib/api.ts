import { Apis } from '@traptitech/traq'

const apis = new Apis({
  basePath: '/api/v3'
})

export * from '@traptitech/traq'
export default apis

export const WEBSOCKET_ENDPOINT = '/api/v3/ws'

export enum ChannelViewerStateEnum {
  VIEWSTATE_NONE = 'none',
  VIEWSTATE_MONITORING = 'monitoring',
  VIEWSTATE_EDITING = 'editing'
}
