import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { rtc } from '.'
import { ActionContext } from 'vuex'
import apis from '@/lib/apis'
import { createSingleflight } from '@/lib/async'
import { WebRTCUserState } from '@traptitech/traq'

export const rtcActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, rtc)

const getWebRTCState = createSingleflight(apis.getWebRTCState.bind(apis))

export const actions = defineActions({
  async fetchRTCState(
    context,
    { force = false }: { force?: boolean } = {}
  ): Promise<void> {
    const { state, commit } = rtcActionContext(context)
    if (!force && state.rtcStateFetched) {
      return
    }

    const [{ data: webRTCStates }, shared] = await getWebRTCState()
    if (!shared) {
      commit.setRTCState(webRTCStates)
    }
  },
  updateRTCState(context, state: Readonly<WebRTCUserState>) {
    const { commit } = rtcActionContext(context)
    commit.updateRTCState(state)
  }
})
