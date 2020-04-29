import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { mainView } from './index'
import { ClipFolderId, ChannelId, MessageId } from '@/types/entity-ids'
import { ActionContext } from 'vuex'

export const mainViewActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, mainView)

export const actions = defineActions({
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
      channelId: ChannelId
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
  }
})
