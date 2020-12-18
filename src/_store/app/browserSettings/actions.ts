import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/_store'
import { browserSettings } from './index'
import { ActionContext } from 'vuex'

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
