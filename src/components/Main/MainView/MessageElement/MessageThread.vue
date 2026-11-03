<template>
  <ThreadSummaryCard v-if="thread" :title="thread.name" @open="openThread">
    <template #badge>
      <ThreadUnreadCountBadge :unread-count="unreadCount" />
    </template>
    <ThreadLatestMessage v-if="firstMessage" :latest-message="firstMessage" />
  </ThreadSummaryCard>
</template>

<script lang="ts" setup>
import type { Message } from '@traptitech/traq'

import { computed, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'

import useChannelPath from '/@/composables/useChannelPath'
import apis from '/@/lib/apis'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { useThreadsStore } from '/@/store/entities/threads'
import type { ThreadChannelId } from '/@/types/entity-ids'

import ThreadLatestMessage from './Thread/ThreadLatestMessage.vue'
import ThreadSummaryCard from './Thread/ThreadSummaryCard.vue'
import ThreadUnreadCountBadge from './Thread/ThreadUnreadCountBadge.vue'

const props = defineProps<{
  threadId: ThreadChannelId
}>()

const router = useRouter()
const { channelIdToLink } = useChannelPath()
const { threadsMap, fetchThread } = useThreadsStore()
const { unreadChannelsMap } = useSubscriptionStore()

const thread = computed(() => threadsMap.value.get(props.threadId))
const unreadCount = computed(
  () => unreadChannelsMap.value.get(props.threadId)?.count ?? 0
)
const firstMessage = shallowRef<Message>()

watch(
  () => props.threadId,
  async (threadId, _, onCleanup) => {
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    firstMessage.value = undefined

    try {
      const fetchedThread = await fetchThread(threadId)
      if (!fetchedThread || cancelled) return

      const { data } = await apis.getMessages(
        threadId,
        1,
        undefined,
        undefined,
        undefined,
        undefined,
        'asc'
      )
      if (!cancelled) firstMessage.value = data[0]
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
