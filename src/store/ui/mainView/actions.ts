import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { mainView } from './index'
import { ClipFolderId, ChannelId, MessageId, UserId } from '@/types/entity-ids'

export const mainViewActionContext = (context: any) =>
  moduleActionContext(context, mainView)

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
  changePrimaryViewToDM(context, payload: { userId: UserId }) {
    const { commit } = mainViewActionContext(context)
    commit.setPrimaryView({
      type: 'dm',
      userId: payload.userId
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
