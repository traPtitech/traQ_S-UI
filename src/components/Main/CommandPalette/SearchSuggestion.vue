<template>
  <div :class="$style.container">
    <template v-if="store.currentInput.length > 0">
      <search-suggestion-item
        :item="searchConfirmItem"
        @select="onSelectSuggestion(searchConfirmItem)"
      />
    </template>
    <div :class="$style.header">検索オプション</div>
    <search-suggestion-query-item
      v-for="suggestion in querySuggestions"
      :key="suggestion.insertQuery"
      :insert-query="suggestion.insertQuery"
      :description="suggestion.description"
      @select="onSelectQuerySuggestion(suggestion.insertQuery)"
    />
    <template v-if="historySuggestions.length > 0">
      <div :class="$style.header">過去の検索</div>
      <search-suggestion-history-item
        v-for="suggestion in historySuggestions"
        :key="suggestion"
        :label="suggestion"
        @select="onSelectHistorySuggestion(suggestion)"
        @remove="onRemoveHistorySuggestion(suggestion)"
      />
    </template>
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
      removeHistorySuggestion,
      setCurrentInput,
      addCurrentInput
    } = useCommandPaletteStore()
    const searchConfirmItem = computed(
      (): SuggestionItem => ({
        type: 'search',
        value: store.currentInput
      })
    )
    const onSelectQuerySuggestion = (query: string) => {
      if (store.currentInput !== '') {
        addCurrentInput(` ${query}`)
      } else {
        setCurrentInput(query)
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
      setCurrentInput(label)
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
  overflow-y: auto;
  scrollbar-gutter: stable;
}
.header {
  @include color-ui-secondary;
  padding-left: 1rem;
  margin: 0.5rem 0;
  font-weight: bold;
  user-select: none;
}
</style>
