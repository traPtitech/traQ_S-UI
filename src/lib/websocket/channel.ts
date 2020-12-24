import _store from '@/_store'
import {
  ChannelStaredEvent,
  ChannelUnstaredEvent,
  ChannelViewersChangedEvent
} from './events'

export const onChannelStared = (data: ChannelStaredEvent) => {
  _store.commit.domain.me.addStaredChannel(data.id)
}

export const onChannelUnstared = (data: ChannelUnstaredEvent) => {
  _store.commit.domain.me.deleteStaredChannel(data.id)
}

export const onChannelViewersChanged = (data: ChannelViewersChangedEvent) => {
  _store.commit.domain.messagesView.setCurrentViewer(data.viewers)
}
