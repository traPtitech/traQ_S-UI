import { createDefineListeners } from '../../utils/defineListeners'
import { entityMitt } from '/@/store/entities/mitt'
import { meMitt } from '../me'
import { channelTree } from '.'

export const defineEntityListeners = createDefineListeners<
  typeof channelTree
>()(entityMitt, (listener, { dispatch }) => {
  listener.on('setChannels', () => {
    dispatch.onSetChannels()
  })
  listener.on('addChannel', async channel => {
    dispatch.onAddChannel(channel)
  })
  listener.on('updateChannel', async ({ newChannel, oldChannel, oldPath }) => {
    // 名前も親チャンネルもアーカイブ状態も変わっていないなら構造は変わらない
    if (
      newChannel.name === oldChannel.name &&
      newChannel.parentId === oldChannel.parentId &&
      newChannel.archived === oldChannel.archived
    ) {
      return
    }
    dispatch.onUpdateChannel({ newChannel, oldChannel, oldPath })
  })
})

export const defineMeListeners = createDefineListeners<typeof channelTree>()(
  meMitt,
  (listener, { dispatch }) => {
    listener.on('setSubscriptions', () => {
      dispatch.constructHomeChannelTree()
    })
    listener.on('updateSubscriptions', () => {
      dispatch.constructHomeChannelTree()
    })
  }
)
