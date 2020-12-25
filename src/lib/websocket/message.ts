import apis from '@/lib/apis'
import store from '@/store'
import _store from '@/_store'
import { MessageCreatedEvent, MessageReadEvent } from './events'
import { MessageId } from '@/types/entity-ids'
import { tts } from '../tts'

const isMessageForCurrentChannel = (recievedChannelId: MessageId) => {
  const currentView = _store.state.ui.mainView.primaryView
  return (
    (currentView.type === 'channel' || currentView.type === 'dm') &&
    recievedChannelId === currentView.channelId
  )
}

export const onMessageCreated = async ({ id }: MessageCreatedEvent) => {
  const res = await apis.getMessage(id)

  if (res.data.userId !== _store.state.domain.me.detail?.id) {
    const userDisplayName =
      store.state.entities.usersMap.get(res.data.userId)?.displayName ??
      'はてな'
    tts.addQueue({
      channelId: res.data.channelId,
      userDisplayName,
      text: res.data.content
    })
  }

  if (!isMessageForCurrentChannel(res.data.channelId)) {
    // 未読処理
    const myId = _store.state.domain.me.detail?.id
    if (res.data.userId !== myId) {
      _store.commit.domain.me.upsertUnreadChannel(res.data)
    }
  }
}

export const onMessageRead = ({ id }: MessageReadEvent) => {
  _store.commit.domain.me.deleteUnreadChannel(id)
}
