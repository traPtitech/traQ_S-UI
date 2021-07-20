import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '/@/store'
import { browserSettings } from '.'
import { ActionContext } from 'vuex'

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
