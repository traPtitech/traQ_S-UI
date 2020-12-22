import { defineSubModuleListeners } from '../../utils/defineListeners'
import { entityMitt } from '@/store/entities'
import useChannelPath from '@/use/channelPath'
import _store from '@/_store'
import router, { constructChannelPath } from '@/router'
import { isCurrentChannel } from '@/lib/websocket/channel'
import { channelTreeMitt } from '.'

export const entityListeners = defineSubModuleListeners(
  entityMitt,
  'domain',
  'channelTree',
  (listener, { dispatch }) => {
    listener.on('setChannels', () => {
      dispatch.constructAllTrees()
    })
    listener.on('addChannel', async channel => {
      // 新規追加のときはホームに表示されることはないので構築しない
      await dispatch.constructChannelTree()

      const { channelIdToPathString } = useChannelPath()
      const path = channelIdToPathString(channel.id)
      channelTreeMitt.emit('created', { id: channel.id, path })
    })
    listener.on('updateChannel', async ({ newChannel, oldChannel }) => {
      // 親チャンネルもアーカイブ状態も変わっていないなら構造は変わらない
      if (
        newChannel.parentId === oldChannel.parentId &&
        newChannel.archived === oldChannel.archived
      ) {
        return
      }

      const { channelIdToPathString } = useChannelPath()
      const oldPath = channelIdToPathString(newChannel.id)

      await dispatch.constructAllTrees()

      // TODO: いい感じにする
      if (newChannel.parentId !== oldChannel.parentId) {
        const newPath = channelIdToPathString(newChannel.id)
        channelTreeMitt.emit('moved', { oldPath, newPath })

        _store.dispatch.app.browserSettings.updateOpenChannelNames({
          oldName: oldPath,
          newName: newPath
        })

        if (isCurrentChannel(newChannel.id)) {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          router.replace(constructChannelPath(newPath)).catch(() => {})
        }
      }
    })
  }
)
