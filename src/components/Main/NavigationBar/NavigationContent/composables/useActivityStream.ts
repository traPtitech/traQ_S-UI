import { watch, ref, onMounted } from 'vue'
import { setTimelineStreamingState } from '/@/lib/websocket'
import type { ActivityTimelineMessage } from '@traptitech/traq'
import apis from '/@/lib/apis'
import { messageMitt } from '/@/store/entities/messages'
import type { ChannelId } from '/@/types/entity-ids'
import { createSingleflight } from '/@/lib/basic/async'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useChannelsStore } from '/@/store/entities/channels'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import useMittListener from '/@/composables/utils/useMittListener'

export const ACTIVITY_LENGTH = 50

const getActivityTimeline = createSingleflight(
  apis.getActivityTimeline.bind(apis)
)

const useActivityStream = () => {
  const { restoringPromise, activityMode: mode } = useBrowserSettings()
  const { isChannelSubscribed } = useSubscriptionStore()
  const { channelsMap, bothChannelsMapInitialFetchPromise } = useChannelsStore()

  /**
   * 新しいもの順
   */
  const timeline = ref<ActivityTimelineMessage[]>([])
  const timelineChannelMap = ref(new Map<ChannelId, ActivityTimelineMessage>())

  const fetch = async () => {
    // 無駄な取得を減らすために保存されてる情報が復元されるのを待つ
    await restoringPromise.value
    // ログイン前に取得されるのを回避するために、チャンネル取得を待つ
    // チャンネル取得である必要性はない
    await bothChannelsMapInitialFetchPromise.value

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
    } catch {}
  }

  // 一番最初に表示されたときに実行する
  onMounted(async () => {
    setTimelineStreamingState(mode.value.all)
    await fetch()
  })

  watch(
    mode,
    (newMode, oldMode) => {
      if (newMode.all !== oldMode.all) {
        setTimelineStreamingState(newMode.all)
      }
      fetch()
    },
    { deep: true }
  )

  useMittListener(messageMitt, 'addMessage', ({ message: addedMessage }) => {
    // 通常のチャンネルではない、つまりDMのときは無視
    if (!channelsMap.value.has(addedMessage.channelId)) return

    // 購読チャンネルのみを表示するときに購読してないチャンネルのメッセージは処理しない
    if (!mode.value.all && !isChannelSubscribed(addedMessage.channelId)) {
      return
    }

    // メッセージが重複した場合を無視
    // WebSocket の再接続による refetch と `MESSAGE_CREATED` イベントが同時に発生して、どちらからも同じメッセージを受け取る場合への対応
    if (timeline.value.some(({ id }) => id === addedMessage.id)) {
      return
    }

    // チャンネルアクティビティのとき、同じチャンネルのメッセージを消す
    if (mode.value.perChannel) {
      const sameChannelActivity = timelineChannelMap.value.get(
        addedMessage.channelId
      )
      if (sameChannelActivity) {
        const sameChannelActivityIndex = timeline.value.findIndex(
          a => a.id === sameChannelActivity.id
        )
        timeline.value.splice(sameChannelActivityIndex, 1)
      }
    }
    timeline.value.unshift(addedMessage)
    timelineChannelMap.value.set(addedMessage.channelId, addedMessage)

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
  })
  useMittListener(messageMitt, 'updateMessage', updatedMessage => {
    // 通常のチャンネルではない、つまりDMのときは無視
    if (!channelsMap.value.has(updatedMessage.channelId)) return

    const sameMessageIndex = timeline.value.findIndex(
      a => a.id === updatedMessage.id
    )
    if (sameMessageIndex < 0) return

    timeline.value[sameMessageIndex] = updatedMessage
  })
  useMittListener(messageMitt, 'deleteMessage', deletedMessageId => {
    const deletedMessage = timeline.value.find(
      ({ id }) => id === deletedMessageId
    )
    if (!deletedMessage) return

    timeline.value = timeline.value.filter(({ id }) => id !== deletedMessageId)
    if (
      timelineChannelMap.value.get(deletedMessage.channelId)?.id ===
      deletedMessage.id
    ) {
      timelineChannelMap.value.delete(deletedMessage.channelId)
    }
  })
  useMittListener(messageMitt, 'reconnect', async () => {
    setTimelineStreamingState(mode.value.all)
    await fetch()
  })

  return { timeline }
}

export default useActivityStream
