import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { me } from './index'
import { ChannelId } from '@/types/entity-ids'
import apis from '@/lib/api'

export const meActionContext = (context: any) =>
  moduleActionContext(context, me)

export const actions = defineActions({
  async fetchMe(context) {
    const { commit } = meActionContext(context)
    const { data } = await apis.getMe()
    commit.setId(data.id)
  },
  async fetchUnreadChannels(context) {
    const { commit } = meActionContext(context)
    const { data } = await apis.getMyUnreadChannels()
    commit.setUnreadChannelsSet(data)
  },

  /** チャンネルを既読にする */
  readChannel(context, payload: { channelId: ChannelId }) {
    const { commit } = meActionContext(context)
    commit.deleteUnreadChannel(payload.channelId)
    apis.readChannel(payload.channelId)
  },

  async fetchStaredChannels(context) {
    const { commit } = meActionContext(context)
    const { data } = await apis.getMyStars()
    commit.setStaredChannels(data)
  },
  async starChannel(context, id: ChannelId) {
    await apis.addMyStar({
      channelId: id
    })
  },
  async unstarChannel(context, id: ChannelId) {
    await apis.removeMyStar(id)
  },
  async fetchStampHistory(context) {
    const { commit } = meActionContext(context)
    const { data } = await apis.getMyStampHistory()
    const history = Object.fromEntries(
      data.map(h => [h.stampId, new Date(h.datetime)])
    )
    commit.setStampHistory(history)
  },
  async fetchMe(context) {
    const { commit } = meActionContext(context)
    const res = await api.getMe()
    commit.setDetail(res.data)
  }
})
