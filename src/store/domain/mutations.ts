import { defineMutations } from 'direct-vuex'
import { UserId, MessageId } from '@/types/entity-ids'
import { ActivityTimelineMessage, UserDetail } from '@traptitech/traq'
import { S } from './state'
import store from '..'
import { ACTIVITY_LENGTH } from '.'

export const mutations = defineMutations<S>()({
  setActivityTimeline(state: S, activities: ActivityTimelineMessage[]) {
    state.activityTimeline = activities
    state.activityTimelineChannelMap = Object.fromEntries(
      activities.map(activity => [activity.channelId, activity])
    )
  },
  addActivity(state: S, activity: ActivityTimelineMessage) {
    // 購読チャンネルのみを表示するときに購読してないチャンネルのメッセージは処理しない
    if (!store.getters.app.browserSettings.isActivityModeAll) {
      const subscriptionLevel =
        store.state.domain.me.subscriptionMap[activity.channelId]
      if (!subscriptionLevel || subscriptionLevel <= 0) {
        return
      }
    }

    // チャンネルアクティビティのとき、同じチャンネルのメッセージを消す
    if (store.getters.app.browserSettings.isActivityModePerChannel) {
      const sameChannelActivity =
        state.activityTimelineChannelMap[activity.channelId]
      if (sameChannelActivity) {
        const sameChannelActivityIndex = state.activityTimeline.findIndex(
          a => a.id === sameChannelActivity.id
        )
        state.activityTimeline.splice(sameChannelActivityIndex, 1)
      }
    }
    state.activityTimeline.unshift(activity)
    state.activityTimelineChannelMap[activity.channelId] = activity

    // ガーベッジコレクタ
    if (state.activityTimeline.length > ACTIVITY_LENGTH * 2) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const lastActivity = state.activityTimeline.pop()!
      if (
        state.activityTimelineChannelMap[lastActivity.channelId]?.id ===
        lastActivity.id
      ) {
        state.activityTimelineChannelMap[lastActivity.channelId] = undefined
      }
    }
  },
  updateActivity(state: S, activity: ActivityTimelineMessage) {
    const sameMessageIndex = state.activityTimeline.findIndex(
      a => a.id === activity.id
    )
    if (sameMessageIndex < 0) return

    state.activityTimeline[sameMessageIndex] = activity
  },
  deleteActivity(state: S, messageId: MessageId) {
    const sameMessageIndex = state.activityTimeline.findIndex(
      a => a.id === messageId
    )
    if (sameMessageIndex < 0) return

    // ガーベッジコレクタ
    const activity = state.activityTimeline[sameMessageIndex]
    state.activityTimeline.splice(sameMessageIndex, 1)
    if (
      state.activityTimelineChannelMap[activity.channelId]?.id === activity.id
    ) {
      state.activityTimelineChannelMap[activity.channelId] = undefined
    }
  },
  setOnlineUsers(state: S, users: UserId[]) {
    state.onlineUsers = users
  },
  addOnlineUser(state: S, userId: UserId) {
    state.onlineUsers.push(userId)
  },
  deleteOnlineUser(state: S, userId: UserId) {
    state.onlineUsers.splice(state.onlineUsers.indexOf(userId), 1)
  },
  setUserDetail: (state, userDetail: UserDetail) => {
    state.userDetails[userDetail.id] = userDetail
  },
  deleteUserDetail: (state, userId: UserId) => {
    delete state.userDetails[userId]
  }
})
