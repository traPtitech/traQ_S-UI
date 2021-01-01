import { defineSubModuleListeners } from '../../utils/defineListeners'
import { entityMitt } from '@/store/entities/mitt'
import { meMitt } from '../me'

export const entityListeners = defineSubModuleListeners(
  entityMitt,
  'domain',
  'channelTree',
  (listener, { dispatch }) => {
    listener.on('setChannels', () => {
      dispatch.onSetChannels()
    })
    listener.on('addChannel', async channel => {
      dispatch.onAddChannel(channel)
    })
    listener.on(
      'updateChannel',
      async ({ newChannel, oldChannel, oldPath }) => {
        // 名前も親チャンネルもアーカイブ状態も変わっていないなら構造は変わらない
        if (
          newChannel.name === oldChannel.name &&
          newChannel.parentId === oldChannel.parentId &&
          newChannel.archived === oldChannel.archived
        ) {
          return
        }
        dispatch.onUpdateChannel({ newChannel, oldChannel, oldPath })
      }
    )
  }
)

export const meListeners = defineSubModuleListeners(
  meMitt,
  'domain',
  'channelTree',
  (listener, { dispatch }) => {
    listener.on('setSubscriptions', () => {
      dispatch.constructHomeChannelTree()
    })
    listener.on('updateSubscriptions', () => {
      dispatch.constructHomeChannelTree()
    })
  }
)
