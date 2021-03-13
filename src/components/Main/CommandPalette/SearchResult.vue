<template>
  <div v-if="fetchingSearchResult" :class="$style.empty">
    <loading-spinner :class="$style.spinner" color="ui-secondary" />
  </div>
  <div
    v-else-if="searchResult.length > 0"
    :class="$style.container"
    ref="containerEle"
  >
    <popup-selector
      v-model="currentSortKey"
      :items="selectorItems"
      :class="$style.sortSelector"
      small
    />
    <div
      v-for="message in searchResult"
      :key="message.id"
      :class="$style.elementContainer"
    >
      <search-result-message-element
        :message="message"
        :current-sort-key="currentSortKey"
        @click-open="openMessage"
      />
    </div>
    <div :class="$style.navigation">
      <div
        :class="$style.navigationButton"
        data-direction="previous"
        :aria-hidden="currentPage <= 0"
        @click="jumpToPage(currentPage - 1)"
      >
        <icon name="chevron-left" mdi /> 戻る
      </div>
      <div
        :class="$style.navigationButton"
        data-direction="next"
        :aria-hidden="currentPage >= pageCount - 1"
        @click="jumpToPage(currentPage + 1)"
      >
        次へ <icon name="chevron-right" mdi />
      </div>
    </div>
  </div>
  <div v-else-if="queryEntered" :class="$style.empty">見つかりませんでした</div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watchEffect, watch } from 'vue'
import { useRouter } from 'vue-router'
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
import { SearchMessageSortKey } from '@/use/searchMessage/queryParser'
import Icon from '@/components/UI/Icon.vue'

const selectorItems: PopupSelectorItem[] & { value: SearchMessageSortKey }[] = [
  { value: 'createdAt', title: '新しい順' },
  { value: '-createdAt', title: '古い順' },
  { value: 'updatedAt', title: '最近更新された順' }
]

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
    LoadingSpinner,
    Icon
  },
  name: 'SearchResult',
  setup() {
    const { commandPaletteStore: store } = useCommandPaletteStore()
    const {
      executeSearchForCurrentPage,
      fetchingSearchResult,
      searchResult,
      currentPage,
      jumpToPage: changePage,
      resetPaging,
      pageCount,
      currentSortKey
    } = useSearchMessages()

    watchEffect(() => {
      // `executeSearchForCurrentPage`が現在のページとソートのキーに依存しているので、
      // ページ数やソートキーの更新をかけるだけでここが走る
      executeSearchForCurrentPage(store.query)
    })

    watch(
      // クエリの変更時はページングをリセット
      computed(() => store.query),
      (query, oldQuery) => {
        if (query !== oldQuery) {
          resetPaging()
        }
      }
    )

    const containerEle = ref<HTMLElement | null>(null)

    const queryEntered = computed(() => store.query.length > 0)

    const { openMessage } = useMessageOpener()

    const jumpToPage = (page: number) => {
      changePage(page)
      if (containerEle.value) {
        containerEle.value.scrollTop = 0
      }
    }

    return {
      searchResult,
      fetchingSearchResult,

      currentPage,
      currentSortKey,
      pageCount,
      jumpToPage,

      selectorItems,

      openMessage,
      queryEntered,

      containerEle
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
.navigation {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
}
.navigationButton {
  @include color-ui-secondary;
  display: grid;
  grid-auto-flow: column;
  column-gap: 0.5rem;
  padding: 0.5rem;
  &[data-direction='next'] {
    padding-left: 1rem;
  }
  &[data-direction='previous'] {
    padding-right: 1rem;
  }
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  &[aria-hidden='true'] {
    visibility: hidden;
  }
  &:hover {
    @include background-secondary;
  }
}
</style>
