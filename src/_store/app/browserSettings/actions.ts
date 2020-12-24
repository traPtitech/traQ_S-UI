import { defineActions } from 'direct-vuex'
import store, { moduleActionContext } from '@/_store'
import { browserSettings } from './index'
import { ActionContext } from 'vuex'
import { channelTreeMitt } from '@/store/domain/channelTree'

export const browserSettingsActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, browserSettings)

export const actions = defineActions({
  updateOpenChannelNames(
    context,
    { oldName, newName }: { oldName: string; newName: string }
  ) {
    const { state, commit } = browserSettingsActionContext(context)
    if (state.openChannelName === oldName) {
      commit.setOpenChannelName(newName)
    }
    if (state.lastOpenChannelName === oldName) {
      commit.setLastOpenChannelName(newName)
    }
  }
})

// TODO: いい感じにする
// TODO: 移動したチャンネルの子チャンネルでも変えないといけない？
channelTreeMitt.on('moved', ({ oldPath, newPath }) => {
  store.dispatch.app.browserSettings.updateOpenChannelNames({
    oldName: oldPath,
    newName: newPath
  })
})
