<template>
  <div v-if="fetchingSearchResult" :class="$style.empty">
    <loading-spinner :class="$style.spinner" color="ui-secondary" />
  </div>
  <div v-else-if="searchResult.length > 0" :class="$style.container">
    <popup-selector
      v-model="currentSortKey"
      :items="selectorItems"
      :class="$style.sortSelector"
      small
    />
    <div ref="resultListEle" :class="$style.resultList">
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
      <span :class="$style.page">
        {{ currentPage + 1 }} / {{ pageCount }} ページ
      </span>
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
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { MessageId } from '/@/types/entity-ids'
import { useCommandPaletteInvoker } from '/@/providers/commandPalette'
import PopupSelector, {
  PopupSelectorItem
} from '/@/components/UI/PopupSelector.vue'
import useSearchMessages from './use/searchMessages'
import useKeepScrollPosition from './use/keepScrollPosition'
import SearchResultMessageElement from './SearchResultMessageElement.vue'
import LoadingSpinner from '/@/components/UI/LoadingSpinner.vue'
import { SearchMessageSortKey } from '/@/lib/searchMessage/queryParser'
import Icon from '/@/components/UI/Icon.vue'
import { useOpenLink } from '/@/use/openLink'
import { constructMessagesPath } from '/@/router'

const selectorItems: PopupSelectorItem[] & { value: SearchMessageSortKey }[] = [
  { value: 'createdAt', title: '新しい順' },
  { value: '-createdAt', title: '古い順' },
  { value: 'updatedAt', title: '最近更新された順' }
]

const useMessageOpener = () => {
  const { openLink } = useOpenLink()
  const { closeCommandPalette } = useCommandPaletteInvoker()

  const openMessage = async (e: MouseEvent, messageId: MessageId) => {
    openLink(e, constructMessagesPath(messageId), () => {
      closeCommandPalette()
    })
  }
  return { openMessage }
}

export default defineComponent({
  name: 'SearchResult',
  components: {
    SearchResultMessageElement,
    PopupSelector,
    LoadingSpinner,
    Icon
  },
  setup() {
    const {
      executeSearchForCurrentPage,
      fetchingSearchResult,
      searchResult,
      currentPage,
      jumpToPage: changePage,
      resetPaging,
      pageCount,
      currentSortKey,
      query,
      executed
    } = useSearchMessages()

    watch(
      // クエリの変更時・ソートキーの変更時・現在のページの変更時に取得する
      computed(
        () => [query.value, currentSortKey.value, currentPage.value] as const
      ),
      () => {
        executeSearchForCurrentPage(query.value)
      }
    )

    onMounted(() => {
      // 初回マウント時に取得する
      if (!executed.value) {
        executeSearchForCurrentPage(query.value)
      }
    })

    watch(
      // クエリの変更時・ソートキーの変更時はページングをリセット
      computed(() => [query.value, currentSortKey.value] as const),
      ([query, key], [oldQuery, oldKey]) => {
        if (query !== oldQuery || key !== oldKey) {
          resetPaging()
        }
      }
    )

    const resultListEle = ref<HTMLElement | null>(null)
    const queryEntered = computed(() => query.value.length > 0)

    const { openMessage } = useMessageOpener()

    const jumpToPage = (page: number) => {
      changePage(page)
      if (resultListEle.value) {
        resultListEle.value.scrollTop = 0
      }
    }

    useKeepScrollPosition(resultListEle)

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

      resultListEle
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
}
.sortSelector {
  margin: 1rem;
}
.resultList {
  overflow-y: scroll;
  scrollbar-gutter: stable;
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
  align-items: center;
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
.page {
  @include color-ui-secondary;
}
</style>
