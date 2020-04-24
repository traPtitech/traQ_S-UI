import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { mainView } from './index'
import { ClipFolderId, ChannelId, MessageId } from '@/types/entity-ids'

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
      channelId: payload.channelId
    })
    rootDispatch.domain.messagesView.changeCurrentChannel(payload)
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
