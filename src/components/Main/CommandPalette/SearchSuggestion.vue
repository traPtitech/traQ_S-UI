<template>
  <div v-if="store.currentInput.length > 0" :class="$style.container">
    <search-suggestion-item
      :item="searchConfirmItem"
      @select="onSelectSuggestion(searchConfirmItem)"
    />
  </div>
  <div :class="$style.container">
    <div :class="$style.header">検索オプション</div>
    <search-suggestion-query-item
      v-for="suggestion in querySuggestions"
      :key="suggestion.insertQuery"
      :insert-query="suggestion.insertQuery"
      :description="suggestion.description"
      @select="onSelectQuerySuggestion(suggestion.insertQuery)"
    />
  </div>
  <div v-if="historySuggestions.length > 0" :class="$style.container">
    <div :class="$style.header">過去の検索</div>
    <search-suggestion-history-item
      v-for="suggestion in historySuggestions"
      :key="suggestion"
      :label="suggestion"
      @select="onSelectHistorySuggestion(suggestion)"
      @remove="onRemoveHistorySuggestion(suggestion)"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useCommandPaletteStore } from '/@/providers/commandPalette'
import SearchSuggestionQueryItem from './SearchSuggestionQueryItem.vue'
import SearchSuggestionHistoryItem from './SearchSuggestionHistoryItem.vue'
import SearchSuggestionItem, {
  SuggestionItem
} from './SearchSuggestionItem.vue'

const querySuggestions = [
  { insertQuery: 'in:', description: 'チャンネル名を指定して検索' },
  { insertQuery: 'from:', description: '発言したユーザーで検索' },
  { insertQuery: 'to:', description: 'リプライ先のユーザーで検索' },
  { insertQuery: 'before:', description: '特定の日時より前のメッセージを検索' },
  { insertQuery: 'after:', description: '特定の日時以降のメッセージを検索' }
]

export default defineComponent({
  name: 'SearchSuggestion',
  components: {
    SearchSuggestionQueryItem,
    SearchSuggestionHistoryItem,
    SearchSuggestionItem
  },
  emits: {
    queryInsert: () => true
  },
  setup(props, { emit }) {
    const {
      commandPaletteStore: store,
      settleQuery,
      historySuggestions,
      removeHistorySuggestion
    } = useCommandPaletteStore()
    const searchConfirmItem = computed(
      (): SuggestionItem => ({
        type: 'search',
        value: store.currentInput
      })
    )
    const onSelectQuerySuggestion = (query: string) => {
      if (store.currentInput !== '') {
        store.currentInput += ' '
      }
      store.currentInput += query
      emit('queryInsert')
    }
    const onSelectSuggestion = (item: SuggestionItem) => {
      switch (item.type) {
        case 'search':
          settleQuery()
      }
    }
    const onSelectHistorySuggestion = (label: string) => {
      store.currentInput = label
    }
    const onRemoveHistorySuggestion = (label: string) => {
      removeHistorySuggestion(label)
    }
    return {
      store,
      searchConfirmItem,
      querySuggestions,
      historySuggestions,
      onSelectQuerySuggestion,
      onSelectSuggestion,
      onSelectHistorySuggestion,
      onRemoveHistorySuggestion
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  padding: 0.5rem 0;
}
.header {
  @include color-ui-secondary;
  padding-left: 1rem;
  margin: 0.5rem 0;
  font-weight: bold;
  user-select: none;
}
</style>
