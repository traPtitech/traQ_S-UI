import _store from '@/_store'
import { ChannelStaredEvent, ChannelUnstaredEvent } from './events'

export const onChannelStared = (data: ChannelStaredEvent) => {
  _store.commit.domain.me.addStaredChannel(data.id)
}

export const onChannelUnstared = (data: ChannelUnstaredEvent) => {
  _store.commit.domain.me.deleteStaredChannel(data.id)
}
