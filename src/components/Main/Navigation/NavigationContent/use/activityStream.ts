import { computed, onBeforeUnmount, watch, ref } from 'vue'
import store, { originalStore } from '/@/store'
import { setTimelineStreamingState } from '/@/lib/websocket'
import { ActivityTimelineMessage, Message } from '@traptitech/traq'
import apis from '/@/lib/apis'
import { messageMitt } from '/@/store/entities/messages'
import { ChannelId, MessageId } from '/@/types/entity-ids'
import { createSingleflight } from '/@/lib/async'
import { bothChannelsMapInitialFetchPromise } from '/@/store/entities/promises'

export const ACTIVITY_LENGTH = 50

const getActivityTimeline = createSingleflight(
  apis.getActivityTimeline.bind(apis)
)

const useActivityStream = (props: { show: boolean }) => {
  const mode = computed(() => store.state.app.browserSettings.activityMode)

  /**
   * 新しいもの順
   */
  const timeline = ref<ActivityTimelineMessage[]>([])
  const timelineChannelMap = ref(new Map<ChannelId, ActivityTimelineMessage>())

  const fetch = async () => {
    // 無駄な取得を減らすために保存されてる情報が復元されるのを待つ
    await originalStore.restored
    // ログイン前に取得されるのを回避するために、チャンネル取得を待つ
    // チャンネル取得である必要性はない
    await bothChannelsMapInitialFetchPromise

    try {
      const [{ data: res }, shared] = await getActivityTimeline(
        ACTIVITY_LENGTH,
        mode.value.all,
        mode.value.perChannel
      )
      if (shared) return
      timeline.value = res

      timelineChannelMap.value = new Map(
        res.map(message => [message.channelId, message])
      )
    } catch (e) {}
  }

  // 一番最初に表示されたときに実行する
  const stopWatchShow = watch(
    () => props.show,
    async newShow => {
      if (!newShow) return
      stopWatchShow()

      setTimelineStreamingState(mode.value.all)
      await fetch()
    },
    { immediate: true }
  )

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
  const onAddMessage = ({ message: activity }: { message: Message }) => {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const activity = timeline.value[sameMessageIndex]!
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
