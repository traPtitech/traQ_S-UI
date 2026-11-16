<template>
  <div :class="$style.container">
    <div :class="$style.filterRow">
      <FilterInput
        v-model="query"
        :class="$style.filter"
        on-secondary
        placeholder="タイトルを検索"
        title="スレッドのタイトルを検索"
      />
      <IconToggleButton
        v-model="showArchived"
        :class="$style.archiveToggle"
        icon-name="archive"
        icon-mdi
        title="アーカイブ済みのスレッドのみ表示"
      />
    </div>
    <div>
      <h3 :class="$style.heading">
        {{ showArchived ? 'アーカイブ済み' : 'アクティブ' }}
        ({{ filteredThreads.length }})
      </h3>
      <div v-if="filteredThreads.length" :class="$style.cards">
        <ChannelThreadsSidebarThreadCard
          v-for="{ id, card } in filteredThreads"
          :key="id"
          :to="constructChannelPath(`${channelPath}/${id}`)"
          v-bind="card"
        />
      </div>
      <EmptyState v-else>
        {{
          query.trim()
            ? '一致するスレッドがありません'
            : showArchived
              ? 'アーカイブ済みのスレッドがありません'
              : 'アクティブなスレッドがありません'
        }}
      </EmptyState>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import EmptyState from '/@/components/UI/EmptyState.vue'
import FilterInput from '/@/components/UI/FilterInput.vue'
import IconToggleButton from '/@/components/UI/IconToggleButton.vue'
import useChannelPath from '/@/composables/useChannelPath'
import { constructChannelPath } from '/@/router'

import ChannelThreadsSidebarThreadCard from './ChannelThreadsSidebarThreadCard.vue'
import { getMockThreadItems } from './mockThreads'

const mockAuthorIconUrl = '/img/icons/android-chrome-192x192.png'

const props = defineProps<{
  channelId: string
}>()

const { channelIdToPathString } = useChannelPath()
const channelPath = computed(
  () => channelIdToPathString(props.channelId) ?? props.channelId
)

const threads = getMockThreadItems()
  .sort((a, b) =>
    (b.latestMessage?.createdAt ?? '').localeCompare(
      a.latestMessage?.createdAt ?? ''
    )
  )
  .map(({ thread, creator, parentPreview, unread }) => ({
    id: thread.id,
    card: {
      title: thread.name,
      archived: thread.archived,
      creatorName: creator?.name,
      unread: thread.archived ? undefined : unread,
      parentPreview: parentPreview
        ? {
            authorName: parentPreview.author.name,
            authorIconUrl: mockAuthorIconUrl,
            content: parentPreview.message.content,
            createdAt: parentPreview.message.createdAt
          }
        : undefined
    }
  }))

const query = ref('')
const showArchived = ref(false)
const filteredThreads = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()
  return threads.filter(
    ({ card }) =>
      card.archived === showArchived.value &&
      card.title.toLowerCase().includes(normalizedQuery)
  )
})

watch(
  () => props.channelId,
  () => {
    query.value = ''
    showArchived.value = false
  }
)
</script>

<style lang="scss" module>
.container,
.cards {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.container {
  gap: 24px;
}

.cards {
  gap: 16px;
}

.filterRow {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter {
  flex: 1;
  min-width: 0;
}

.archiveToggle {
  display: flex;
  flex-shrink: 0;
}

.heading {
  @include color-ui-secondary;
  @include size-body2;
  margin: 0 0 8px;
  font-weight: bold;
}
</style>
