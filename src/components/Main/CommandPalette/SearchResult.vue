<template>
  <div v-if="sortedMessages.length > 0" :class="$style.container">
    <popup-selector
      v-model="selectorValue"
      :items="selectorItems"
      :class="$style.sortSelector"
      small
    />
    <div
      v-for="message in sortedMessages"
      :key="message.id"
      :class="$style.elementContainer"
    >
      <search-result-message-element
        :message="message"
        @click-open="openMessage"
      />
    </div>
  </div>
  <div v-else-if="fetchingSearchResult" :class="$style.empty">
    <loading-spinner :class="$style.spinner" color="ui-secondary" />
  </div>
  <div v-else-if="queryEntered" :class="$style.empty">見つかりませんでした</div>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@traptitech/traq'
import { compareDateString } from '@/lib/date'
import { MessageId } from '@/types/entity-ids'
import { RouteName } from '@/router'
import {
  useCommandPaletteInvoker,
  useCommandPaletteStore
} from '@/providers/commandPalette'
import PopupSelector, {
  PopupSelectorItem
} from '@/components/UI/PopupSelector.vue'
import useSearchMessages from './use/searchMessages'
import SearchResultMessageElement from './SearchResultMessageElement.vue'
import LoadingSpinner from '@/components/UI/LoadingSpinner.vue'

const sortKeyCreatedAtLatest = 'created_at_latest'
const sortKeyCreatedAtOldest = 'created_at_oldest'
const sortKeyUpdatedAtLatest = 'updated_at_latest'

const useSort = (
  resultMessages: Ref<Message[]>,
  selectorValue: Ref<string>
) => {
  const selectorItems: PopupSelectorItem[] = [
    { value: sortKeyCreatedAtLatest, title: '新しい順' },
    { value: sortKeyCreatedAtOldest, title: '古い順' },
    { value: sortKeyUpdatedAtLatest, title: '最近更新された順' }
  ]

  const sortedMessages = computed(() => {
    if (selectorValue.value === sortKeyCreatedAtLatest) {
      return resultMessages.value.sort((m1, m2) =>
        compareDateString(m1.createdAt, m2.createdAt, true)
      )
    }
    if (selectorValue.value === sortKeyCreatedAtOldest) {
      return resultMessages.value.sort((m1, m2) =>
        compareDateString(m1.createdAt, m2.createdAt)
      )
    }
    if (selectorValue.value === sortKeyUpdatedAtLatest) {
      return resultMessages.value.sort((m1, m2) =>
        compareDateString(m1.updatedAt, m2.updatedAt, true)
      )
    }
    return resultMessages.value
  })

  return { selectorItems, sortedMessages }
}

const useMessageOpener = () => {
  const router = useRouter()
  const { closeCommandPalette } = useCommandPaletteInvoker()
  const openMessage = async (messageId: MessageId) => {
    closeCommandPalette()
    router.push({ name: RouteName.Message, params: { id: messageId } })
  }
  return { openMessage }
}

export default defineComponent({
  components: {
    SearchResultMessageElement,
    PopupSelector,
    LoadingSpinner
  },
  name: 'SearchResult',
  setup() {
    const { commandPaletteStore: store } = useCommandPaletteStore()
    const resultMessages = ref<Message[]>([])
    const { fetchMessagesBySearch, fetchingSearchResult } = useSearchMessages()

    watchEffect(async () => {
      resultMessages.value = []
      const res = await fetchMessagesBySearch(store.query)
      resultMessages.value = res.hits
    })

    const selectorValue = ref(sortKeyCreatedAtLatest)

    const { selectorItems, sortedMessages } = useSort(
      resultMessages,
      selectorValue
    )

    const queryEntered = computed(() => store.query.length > 0)

    const { openMessage } = useMessageOpener()

    return {
      selectorItems,
      selectorValue,
      sortedMessages,
      openMessage,
      queryEntered,
      fetchingSearchResult
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
  overflow-y: scroll;
  width: 100%;
}
.sortSelector {
  margin: 1rem;
}
.elementContainer {
  margin-bottom: 0.5rem;
}
.spinner {
  opacity: 0.5;
}
.empty {
  @include color-ui-secondary;
  display: grid;
  align-items: center;
  justify-items: center;

  width: 100%;
  padding: 4rem 0;
  user-select: none;
}
</style>
