import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '/@/store'
import { rtc } from '.'
import { ActionContext } from 'vuex'
import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { WebRTCUserState, WebRTCUserStateSessions } from '@traptitech/traq'
import { SessionId, UserRTCState, UserSessionState } from './state'
import { changeRTCState } from '/@/lib/websocket'
import { ChannelId } from '/@/types/entity-ids'

export const rtcActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, rtc)

const getWebRTCState = createSingleflight(apis.getWebRTCState.bind(apis))

/**
 * サーバーに状態を送信する
 */
const postRTCState = (state: Readonly<UserRTCState> | null) => {
  if (!state) {
    changeRTCState(null, [])
    return
  }
  const userStateSessions: WebRTCUserStateSessions[] = state.sessionStates.map(
    s => ({
      state: s.states.join('.'),
      sessionId: s.sessionId
    })
  )
  changeRTCState(state.channelId, userStateSessions)
}

export const actions = defineActions({
  async fetchRTCState(
    context,
    { ignoreCache = false }: { ignoreCache?: boolean } = {}
  ): Promise<void> {
    const { state, commit } = rtcActionContext(context)
    if (!ignoreCache && state.rtcStateFetched) {
      return
    }

    const [{ data: webRTCStates }, shared] = await getWebRTCState()
    if (!shared) {
      commit.setRTCState(webRTCStates)
    }
  },
  /** サーバーの情報をローカルに反映する */
  updateRTCState(context, state: Readonly<WebRTCUserState>) {
    const { commit } = rtcActionContext(context)
    commit.updateRTCState(state)
  },

  /** サーバーに状態を追加するリクエストを送信する */
  addRTCSession(
    context,
    payload: { channelId: ChannelId; state: UserSessionState }
  ) {
    const { getters } = rtcActionContext(context)
    const currentState = getters.currentRTCState ?? {
      channelId: payload.channelId,
      sessionStates: []
    }

    postRTCState({
      channelId: currentState.channelId,
      sessionStates: [...currentState.sessionStates, payload.state]
    })
  },
  /** サーバーに状態を削除するリクエストを送信する */
  removeRTCSession(context, payload: { sessionId: SessionId }) {
    const { getters } = rtcActionContext(context)
    const currentState = getters.currentRTCState
    if (!currentState) return

    const sessionStates = currentState.sessionStates.filter(
      s => s.sessionId !== payload.sessionId
    )

    if (sessionStates.length === 0) {
      postRTCState(null)
    } else {
      postRTCState({
        channelId: currentState.channelId,
        sessionStates: sessionStates
      })
    }
  },
  /** サーバーに状態を変更するリクエストを送信する */
  async modifyRTCSession(
    context,
    payload: { sessionId: SessionId; states: string[] }
  ) {
    const { getters } = rtcActionContext(context)
    const currentState = getters.currentRTCState
    if (!currentState) return

    const index = currentState.sessionStates.findIndex(
      s => s.sessionId === payload.sessionId
    )
    if (index < 0) return
    const newSessionStates = [...currentState.sessionStates]
    newSessionStates[index] = payload

    postRTCState({
      channelId: currentState.channelId,
      sessionStates: newSessionStates
    })
  }
})
