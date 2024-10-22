<template>
  <div :class="$style.container">
    <template v-if="currentInput.length > 0">
      <search-suggestion-item
        :item="searchConfirmItem"
        @select="onSelectSuggestion(searchConfirmItem)"
      />
    </template>
    <div :class="$style.header">検索オプション</div>
    <search-suggestion-query-item
      v-for="suggestion in querySuggestions"
      :key="suggestion.insertQuery"
      :description="suggestion.description"
      :example="suggestion.example"
      @select="onSelectQuerySuggestion(suggestion.insertQuery)"
    />
    <template v-if="searchHistories.length > 0">
      <div :class="$style.header">過去の検索</div>
      <search-suggestion-history-item
        v-for="suggestion in searchHistories"
        :key="suggestion"
        :label="suggestion"
        @select="onSelectHistorySuggestion(suggestion)"
        @remove="removeSearchHistory(suggestion)"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useCommandPalette } from '/@/store/app/commandPalette'
import type { SuggestionItem } from './SearchSuggestionItem.vue'
import SearchSuggestionQueryItem from './SearchSuggestionQueryItem.vue'
import SearchSuggestionHistoryItem from './SearchSuggestionHistoryItem.vue'
import SearchSuggestionItem from './SearchSuggestionItem.vue'
import { useResponsiveStore } from '/@/store/ui/responsive'

const emit = defineEmits<{
  (e: 'queryInsert'): void
}>()

const { isMobile } = useResponsiveStore()

const querySuggestions = computed(() => [
  {
    insertQuery: 'in:',
    description: 'チャンネル名を指定',
    example: 'in:general'
  },
  {
    insertQuery: 'from:',
    description: '投稿したユーザーを指定',
    example: 'from:traP'
  },
  {
    insertQuery: 'to:',
    description: 'メンションされたユーザーを指定',
    example: 'to:traP'
  },
  {
    insertQuery: 'before:',
    description: '特定の日時以前のメッセージ',
    example: `before:2020-01-23${
      !isMobile.value ? ', before:2020-01-23T00:00' : ''
    }`
  },
  {
    insertQuery: 'after:',
    description: '特定の日時以降のメッセージ',
    example: `after:2020-01-23${
      !isMobile.value ? ', after:2020-01-23T00:00' : ''
    }`
  }
])

const { currentInput, searchHistories, settleQuery, removeSearchHistory } =
  useCommandPalette()
const searchConfirmItem = computed(
  (): SuggestionItem => ({
    type: 'search',
    value: currentInput.value
  })
)
const onSelectQuerySuggestion = (query: string) => {
  if (currentInput.value !== '') {
    currentInput.value += ` ${query}`
  } else {
    currentInput.value = query
  }
  emit('queryInsert')
}
const onSelectSuggestion = (item: SuggestionItem) => {
  switch (item.type) {
    case 'search':
      settleQuery()
  }
}
const onSelectHistorySuggestion = (label: string) => {
  currentInput.value = label
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  padding: 0.5rem 0;
  overflow-y: auto;
}
.header {
  @include color-ui-secondary;
  padding-left: 1rem;
  margin: 0.5rem 0;
  font-weight: bold;
  user-select: none;
}
</style>
