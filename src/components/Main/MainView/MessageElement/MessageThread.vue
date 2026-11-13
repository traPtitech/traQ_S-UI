<template>
  <ThreadSummaryCard v-if="thread" :title="thread.name" @open="openThread">
    <template #badge>
      <ThreadUnreadCountBadge :unread-count="unreadCount" />
    </template>
    <ThreadLatestMessage v-if="latestMessage" :latest-message="latestMessage" />
  </ThreadSummaryCard>
</template>

<script lang="ts" setup>
import { computed, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'

import useChannelPath from '/@/composables/useChannelPath'
import useMittListener from '/@/composables/utils/useMittListener'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { messageMitt, useMessagesStore } from '/@/store/entities/messages'
import { useThreadsStore } from '/@/store/entities/threads'
import type { MessageId, ThreadChannelId } from '/@/types/entity-ids'

import ThreadLatestMessage from './Thread/ThreadLatestMessage.vue'
import ThreadSummaryCard from './Thread/ThreadSummaryCard.vue'
import ThreadUnreadCountBadge from './Thread/ThreadUnreadCountBadge.vue'

const props = defineProps<{
  threadId: ThreadChannelId
}>()

const router = useRouter()
const { channelIdToLink } = useChannelPath()
const { threadsMap, fetchThread } = useThreadsStore()
const { messagesMap, fetchLatestMessage } = useMessagesStore()
const { unreadChannelsMap } = useSubscriptionStore()

const thread = computed(() => threadsMap.value.get(props.threadId))
const unreadCount = computed(
  () => unreadChannelsMap.value.get(props.threadId)?.count ?? 0
)
const latestMessageId = shallowRef<MessageId>()
const latestMessage = computed(() =>
  latestMessageId.value
    ? messagesMap.value.get(latestMessageId.value)
    : undefined
)

useMittListener(messageMitt, 'addMessage', ({ message }) => {
  if (message.channelId !== props.threadId) return
  latestMessageId.value = message.id
})

useMittListener(messageMitt, 'deleteMessage', async messageId => {
  if (latestMessageId.value !== messageId) return
  const threadId = props.threadId

  try {
    const message = await fetchLatestMessage(threadId)
    if (props.threadId === threadId && latestMessageId.value === messageId) {
      latestMessageId.value = message?.id
    }
  } catch (error) {
    // eslint-disable-next-line no-console -- API取得失敗の調査用
    console.error('スレッドの最新メッセージの取得に失敗しました', error)
  }
})

watch(
  () => props.threadId,
  async (threadId, _, onCleanup) => {
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    latestMessageId.value = undefined

    try {
      const fetchedThread = await fetchThread(threadId)
      if (!fetchedThread || cancelled) return

      const message = await fetchLatestMessage(threadId)
      if (!cancelled && !latestMessageId.value) {
        latestMessageId.value = message?.id
      }
    } catch (error) {
      // eslint-disable-next-line no-console -- API取得失敗の調査用
      if (!cancelled) console.error('スレッドの取得に失敗しました', error)
    }
  },
  { immediate: true }
)

const openThread = () => {
  if (!thread.value) return
  const link = channelIdToLink(props.threadId)
  if (link) router.push(link)
}
</script>
