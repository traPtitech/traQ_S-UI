import { defineActions } from 'direct-vuex'
import store, { moduleActionContext } from '@/_store'
import { browserSettings } from './index'
import { ActionContext } from 'vuex'
import { channelTreeMitt } from '@/store/domain/channelTree'

export const browserSettingsActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, browserSettings)

const replaceStart = (str: string, before: string, after: string) =>
  `${after}${str.slice(before.length)}`

export const actions = defineActions({
  updateOpenChannelNames(
    context,
    { oldName, newName }: { oldName: string; newName: string }
  ) {
    const { state, commit } = browserSettingsActionContext(context)
    if (state.openChannelName.startsWith(oldName)) {
      commit.setOpenChannelName(
        replaceStart(state.openChannelName, oldName, newName)
      )
    }
    if (state.lastOpenChannelName.startsWith(oldName)) {
      commit.setLastOpenChannelName(
        replaceStart(state.openChannelName, oldName, newName)
      )
    }
  }
})

// TODO: いい感じにする
channelTreeMitt.on('moved', ({ oldPath, newPath }) => {
  store.dispatch.app.browserSettings.updateOpenChannelNames({
    oldName: oldPath,
    newName: newPath
  })
})
