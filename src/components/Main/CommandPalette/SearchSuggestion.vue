<template>
  <div v-if="store.currentInput.length === 0" :class="$style.container">
    <div :class="$style.header">検索オプション</div>
    <search-suggestion-query-item
      v-for="suggestion in querySuggestions"
      :key="suggestion.insertQuery"
      :insert-query="suggestion.insertQuery"
      :description="suggestion.description"
      @select="onSelectQuerySuggestion(suggestion.insertQuery)"
    />
  </div>
  <div v-else :class="$style.container">
    <search-suggestion-item
      :item="searchConfirmItem"
      @select="onSelectSuggestion(searchConfirmItem)"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useCommandPaletteStore } from '@/providers/commandPalette'
import SearchSuggestionQueryItem from './SearchSuggestionQueryItem.vue'
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
  components: { SearchSuggestionQueryItem, SearchSuggestionItem },
  name: 'SearchSuggestion',
  emits: {
    queryInsert: () => true
  },
  setup(_, context) {
    const { commandPaletteStore: store, settleQuery } = useCommandPaletteStore()
    const searchConfirmItem = computed(
      (): SuggestionItem => ({
        type: 'search',
        value: store.currentInput
      })
    )
    const onSelectQuerySuggestion = (query: string) => {
      store.currentInput += query
      context.emit('queryInsert')
    }
    const onSelectSuggestion = (item: SuggestionItem) => {
      switch (item.type) {
        case 'search':
          settleQuery()
      }
    }
    return {
      store,
      searchConfirmItem,
      querySuggestions,
      onSelectQuerySuggestion,
      onSelectSuggestion
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
