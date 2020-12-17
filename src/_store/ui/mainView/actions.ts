import { defineActions } from 'direct-vuex'
import _store, { moduleActionContext } from '@/_store'
import store from '@/store'
import { mainView } from './index'
import {
  ClipFolderId,
  ChannelId,
  MessageId,
  DMChannelId
} from '@/types/entity-ids'
import { ActionContext } from 'vuex'

export const mainViewActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, mainView)

export const actions = defineActions({
  async changePrimaryViewToChannelOrDM(
    context,
    payload: { channelId: ChannelId | DMChannelId; entryMessageId?: MessageId }
  ) {
    const { dispatch } = mainViewActionContext(context)
    const DMChannel = _store.state.entities.dmChannels[payload.channelId]
    if (DMChannel) {
      if (!store.state.entities.usersMap.has(DMChannel.userId)) {
        await store.dispatch.entities.fetchUser({
          userId: DMChannel.userId,
          cacheStrategy: 'useCache'
        })
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const user = store.state.entities.usersMap.get(DMChannel.userId)!

      dispatch.changePrimaryViewToDM({
        ...payload,
        userName: user.name
      })
      return
    }
    dispatch.changePrimaryViewToChannel(payload)
  },
  changePrimaryViewToChannel(
    context,
    payload: { channelId: ChannelId; entryMessageId?: MessageId }
  ) {
    const { commit, rootDispatch } = mainViewActionContext(context)
    commit.setPrimaryView({
      type: 'channel',
      channelId: payload.channelId,
      entryMessageId: payload.entryMessageId
    })
    rootDispatch.domain.messagesView.changeCurrentChannel(payload)
  },
  changePrimaryViewToDM(
    context,
    payload: {
      channelId: DMChannelId
      userName: string
      entryMessageId?: MessageId
    }
  ) {
    const { commit, rootDispatch } = mainViewActionContext(context)
    commit.setPrimaryView({
      type: 'dm',
      channelId: payload.channelId,
      userName: payload.userName,
      entryMessageId: payload.entryMessageId
    })
    rootDispatch.domain.messagesView.changeCurrentChannel({
      ...payload,
      isDM: true
    })
  },
  changePrimaryViewToClip(
    context,
    { clipFolderId }: { clipFolderId: ClipFolderId }
  ) {
    const { commit, rootDispatch } = mainViewActionContext(context)
    commit.setPrimaryView({
      type: 'clips',
      clipFolderId
    })
    rootDispatch.domain.messagesView.changeCurrentClipFolder(clipFolderId)
  },
  changePrimaryViewToNull(context) {
    const { commit } = mainViewActionContext(context)
    commit.setPrimaryView({ type: 'null' })
  }
})
