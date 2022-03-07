import { channelTreeMitt } from '/@/vuex/domain/channelTree'
import { browserSettings } from '.'
import { createDefineListeners } from '../../utils/defineListeners'

export const defineChannelTreeListeners = createDefineListeners<
  typeof browserSettings
>()(channelTreeMitt, (listener, { dispatch }) => {
  listener.on('moved', ({ oldPath, newPath }) => {
    dispatch.updateOpenChannelNames({
      oldName: oldPath,
      newName: newPath
    })
  })
})
