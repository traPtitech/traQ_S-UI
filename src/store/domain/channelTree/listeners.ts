import { defineSubModuleListeners } from '../../utils/defineListeners'
import { entityMitt } from '@/store/entities/mitt'

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
    listener.on('updateChannel', async ({ newChannel, oldChannel }) => {
      // 親チャンネルもアーカイブ状態も変わっていないなら構造は変わらない
      if (
        newChannel.parentId === oldChannel.parentId &&
        newChannel.archived === oldChannel.archived
      ) {
        return
      }
      dispatch.onUpdateChannel({ newChannel, oldChannel })
    })
  }
)
