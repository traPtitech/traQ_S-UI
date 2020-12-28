import { computed, onBeforeUnmount, watch, onMounted, ref } from 'vue'
import store from '@/store'
import _store from '@/_store'
import { setTimelineStreamingState } from '@/lib/websocket'
import { ActivityTimelineMessage, Message } from '@traptitech/traq'
import apis from '@/lib/apis'
import { messageMitt } from '@/store/entities/messages'
import { ChannelId, MessageId } from '@/types/entity-ids'

export const ACTIVITY_LENGTH = 50

const useActivityStream = () => {
  const mode = computed(() => _store.state.app.browserSettings.activityMode)

  /**
   * 新しいもの順
   */
  const timeline = ref<ActivityTimelineMessage[]>([])
  const timelineChannelMap = ref(new Map<ChannelId, ActivityTimelineMessage>())

  const fetch = async () => {
    try {
      const { data: res } = await apis.getActivityTimeline(
        ACTIVITY_LENGTH,
        mode.value.all,
        mode.value.perChannel
      )
      timeline.value = res

      timelineChannelMap.value = new Map(
        res.map(message => [message.channelId, message])
      )
    } catch (e) {}
  }

  onMounted(async () => {
    setTimelineStreamingState(mode.value.all)
    await fetch()
  })

  watch(mode, (newMode, oldMode) => {
    if (newMode.all !== oldMode.all) {
      setTimelineStreamingState(newMode.all)
    }
    fetch()
  })

  const onReconnect = async () => {
    setTimelineStreamingState(mode.value.all)
    await fetch()
  }
  const onAddMessage = (activity: Message) => {
    // 通常のチャンネルではない、つまりDMのときは無視
    if (!store.state.entities.channelsMap.has(activity.channelId)) return

    // 購読チャンネルのみを表示するときに購読してないチャンネルのメッセージは処理しない
    if (!mode.value.all) {
      if (!store.getters.domain.me.isChannelSubscribed(activity.channelId)) {
        return
      }
    }

    // チャンネルアクティビティのとき、同じチャンネルのメッセージを消す
    if (mode.value.perChannel) {
      const sameChannelActivity = timelineChannelMap.value.get(
        activity.channelId
      )
      if (sameChannelActivity) {
        const sameChannelActivityIndex = timeline.value.findIndex(
          a => a.id === sameChannelActivity.id
        )
        timeline.value.splice(sameChannelActivityIndex, 1)
      }
    }
    timeline.value.unshift(activity)
    timelineChannelMap.value.set(activity.channelId, activity)

    // ガーベッジコレクタ
    if (timeline.value.length > ACTIVITY_LENGTH * 2) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const lastActivity = timeline.value.pop()!
      if (
        timelineChannelMap.value.get(lastActivity.channelId)?.id ===
        lastActivity.id
      ) {
        timelineChannelMap.value.delete(lastActivity.channelId)
      }
    }
  }
  const onUpdateMessage = (activity: Message) => {
    // 通常のチャンネルではない、つまりDMのときは無視
    if (!store.state.entities.channelsMap.has(activity.channelId)) return

    const sameMessageIndex = timeline.value.findIndex(a => a.id === activity.id)
    if (sameMessageIndex < 0) return

    timeline.value[sameMessageIndex] = activity
  }
  const onDeleteMessage = (messageId: MessageId) => {
    const sameMessageIndex = timeline.value.findIndex(a => a.id === messageId)
    if (sameMessageIndex < 0) return

    // ガーベッジコレクタ
    const activity = timeline.value[sameMessageIndex]
    timeline.value.splice(sameMessageIndex, 1)
    if (timelineChannelMap.value.get(activity.channelId)?.id === activity.id) {
      timelineChannelMap.value.delete(activity.channelId)
    }
  }

  messageMitt.on('reconnect', onReconnect)
  messageMitt.on('addMessage', onAddMessage)
  messageMitt.on('updateMessage', onUpdateMessage)
  messageMitt.on('deleteMessage', onDeleteMessage)

  onBeforeUnmount(() => {
    messageMitt.off('reconnect', onReconnect)
    messageMitt.off('addMessage', onAddMessage)
    messageMitt.off('updateMessage', onUpdateMessage)
    messageMitt.off('deleteMessage', onDeleteMessage)
  })

  return { timeline }
}

export default useActivityStream
