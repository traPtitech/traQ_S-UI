<template>
  <div v-if="fetchingSearchResult" :class="$style.empty">
    <LoadingSpinner :class="$style.spinner" color="ui-secondary" />
  </div>
  <div v-else-if="searchError !== undefined" :class="$style.empty" role="alert">
    <p>検索に失敗しました</p>
    <FormButton label="再試行" type="secondary" @click="searchForCurrentPage" />
  </div>
  <div v-else-if="hasCurrentResult && queryEntered" :class="$style.container">
    <template v-if="searchResult.length > 0">
      <PopupSelector
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
          <SearchResultMessageElement
            :message="message"
            :current-sort-key="currentSortKey"
            @click-open="openMessage"
            @rendered="didRender(message.id)"
          />
        </div>
      </div>
    </template>
    <div v-else :class="$style.empty">
      {{
        pageCount > 1
          ? 'このページに表示できるメッセージはありません'
          : '見つかりませんでした'
      }}
    </div>
    <div v-if="pageCount > 0" :class="$style.navigation">
      <div
        :class="$style.navigationButton"
        data-direction="previous"
        :aria-hidden="currentPage <= 0"
        @click="jumpToPage(currentPage - 1)"
      >
        <AIcon name="chevron-left" mdi /> 戻る
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
        次へ <AIcon name="chevron-right" mdi />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import AIcon from '/@/components/UI/AIcon.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import LoadingSpinner from '/@/components/UI/LoadingSpinner.vue'
import type { PopupSelectorItem } from '/@/components/UI/PopupSelector.vue'
import PopupSelector from '/@/components/UI/PopupSelector.vue'
import { useOpenLink } from '/@/composables/useOpenLink'
import type { SearchMessageSortKey } from '/@/lib/searchMessage/queryParser'
import { constructMessagesPath } from '/@/router'
import { useCommandPalette } from '/@/store/app/commandPalette'
import type { MessageId } from '/@/types/entity-ids'

import SearchResultMessageElement from './SearchResultMessageElement.vue'
import useKeepScrollPosition from './composables/useKeepScrollPosition'
import useSearchMessages from './composables/useSearchMessages'

const selectorItems: PopupSelectorItem<SearchMessageSortKey>[] &
  { value: SearchMessageSortKey }[] = [
  { value: 'createdAt', title: '新しい順' },
  { value: '-createdAt', title: '古い順' },
  { value: 'updatedAt', title: '最近更新された順' }
]

const {
  executeSearchForCurrentPage,
  fetchingSearchResult,
  searchError,
  searchResult,
  currentPage,
  jumpToPage: changePage,
  resetPaging,
  pageCount,
  currentSortKey,
  query,
  hasCurrentResult
} = useSearchMessages()

const searchForCurrentPage = () => {
  void executeSearchForCurrentPage().catch(() => undefined)
}

watch(
  // クエリの変更時・ソートキーの変更時・現在のページの変更時に取得する
  () => [query.value, currentSortKey.value, currentPage.value] as const,
  ([query, key], [oldQuery, oldKey]) => {
    // クエリの変更時・ソートキーの変更時はページングをリセット
    if (query !== oldQuery || key !== oldKey) {
      resetPaging()
    }
    searchForCurrentPage()
  }
)

onMounted(() => {
  // 初回マウント時に取得する
  if (!hasCurrentResult.value) {
    searchForCurrentPage()
  }
})
onBeforeUnmount(() => {
  // 検索クエリを空にして Enter を押したときにリセットされるようにする
  if (query.value === '') {
    resetPaging()
    noRestore()
  }
})

const resultListEle = ref<HTMLElement | null>(null)
const queryEntered = computed(() => query.value.length > 0)

const { openLink } = useOpenLink()
const { closeCommandPalette } = useCommandPalette()
const openMessage = async (e: MouseEvent, messageId: MessageId) => {
  openLink(e, constructMessagesPath(messageId), () => {
    closeCommandPalette()
  })
}

const jumpToPage = (page: number) => {
  changePage(page)
  if (resultListEle.value) {
    resultListEle.value.scrollTop = 0
  }
}

const { didRender, noRestore } = useKeepScrollPosition(
  resultListEle,
  computed(() => searchResult.value.map(message => message.id))
)
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
