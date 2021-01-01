import { channelTreeMitt } from '@/store/domain/channelTree'
import { defineSubModuleListeners } from '../../utils/defineListeners'

export const channelTreeListeners = defineSubModuleListeners(
  channelTreeMitt,
  'app',
  'browserSettings',
  (listener, { dispatch }) => {
    listener.on('moved', ({ oldPath, newPath }) => {
      dispatch.updateOpenChannelNames({
        oldName: oldPath,
        newName: newPath
      })
    })
  }
)
