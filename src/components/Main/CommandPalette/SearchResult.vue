<template>
  <div v-if="fetchingSearchResult || debouncing" :class="$style.empty">
    <LoadingSpinner :class="$style.spinner" color="ui-secondary" />
  </div>
  <div v-else-if="searchResult.length > 0" :class="$style.container">
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
  </div>
  <div v-else-if="queryEntered" :class="$style.empty">見つかりませんでした</div>

  <PageNavigator
    v-model:page="currentPage"
    :page-count="pageCount"
    @update:page="jumpToPage"
  />
</template>

<script lang="ts" setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  watchEffect
} from 'vue'
import useKeepScrollPosition from './composables/useKeepScrollPosition'
import useSearchMessages from './composables/useSearchMessages'
import SearchResultMessageElement from './SearchResultMessageElement.vue'
import LoadingSpinner from '/@/components/UI/LoadingSpinner.vue'
import type { PopupSelectorItem } from '/@/components/UI/PopupSelector.vue'
import PopupSelector from '/@/components/UI/PopupSelector.vue'
import { useOpenLink } from '/@/composables/useOpenLink'
import type { SearchMessageSortKey } from '/@/lib/searchMessage/queryParser'
import { constructMessagesPath } from '/@/router'
import { useCommandPalette } from '/@/store/app/commandPalette'
import type { MessageId } from '/@/types/entity-ids'
import PageNavigator from './Pagination/PageNavigator.vue'
import { debounce } from 'throttle-debounce'

const selectorItems: PopupSelectorItem<SearchMessageSortKey>[] &
  { value: SearchMessageSortKey }[] = [
  { value: 'createdAt', title: '新しい順' },
  { value: '-createdAt', title: '古い順' },
  { value: 'updatedAt', title: '最近更新された順' }
]

const {
  executeSearchForCurrentPage,
  fetchingSearchResult,
  searchResult,
  currentPage,
  jumpToPage,
  resetPaging,
  pageCount,
  currentSortKey,
  query,
  executed
} = useSearchMessages()

const debouncing = ref(false)

const changeState = debounce(256, ([query, key], [oldQuery, oldKey], _page) => {
  // クエリの変更時・ソートキーの変更時はページングをリセット
  if (query !== oldQuery || key !== oldKey) {
    resetPaging()
  }
  executeSearchForCurrentPage(query)
  debouncing.value = false
})

watch(
  // クエリの変更時・ソートキーの変更時・現在のページの変更時に取得する
  () => [query.value, currentSortKey.value, currentPage.value] as const,
  (...inputs) => {
    debouncing.value = true
    changeState(...inputs)
  }
)

onMounted(() => {
  // 初回マウント時に取得する
  if (!executed.value) {
    executeSearchForCurrentPage(query.value)
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
watchEffect(() => {
  jumpToPage(currentPage.value)
  if (resultListEle.value) {
    resultListEle.value.scrollTop = 0
  }
})

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
