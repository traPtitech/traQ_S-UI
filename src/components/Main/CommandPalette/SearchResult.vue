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
      <search-result-message-element :message="message" />
    </div>
  </div>
  <div v-else :class="$style.container"></div>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watchEffect } from 'vue'
import { Message } from '@traptitech/traq'
import SearchResultMessageElement from './SearchResultMessageElement.vue'
import { useCommandPaletteStore } from '@/providers/commandPalette'
import useSearchMessages from './use/searchMessages'
import PopupSelector, {
  PopupSelectorItem
} from '@/components/UI/PopupSelector.vue'
import { compareDateString } from '@/lib/util/date'

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

export default defineComponent({
  components: { SearchResultMessageElement, PopupSelector },
  name: 'SearchResult',
  setup() {
    const { commandPaletteStore: store } = useCommandPaletteStore()
    const resultMessages = ref<Message[]>([])
    const { fetchMessagesBySearch } = useSearchMessages()
    watchEffect(async () => {
      const res = await fetchMessagesBySearch(store.query)
      resultMessages.value = res.hits
    })

    const selectorValue = ref(sortKeyCreatedAtLatest)

    const { selectorItems, sortedMessages } = useSort(
      resultMessages,
      selectorValue
    )

    return { selectorItems, selectorValue, sortedMessages }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
  padding: 1rem;
  overflow-y: scroll;
}
.sortSelector {
  margin-bottom: 1rem;
}
.elementContainer {
  margin-bottom: 1rem;
  &:last-child {
    margin-bottom: 0.5rem;
  }
}
</style>
