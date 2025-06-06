<template>
  <div :class="$style.container">
    <h4>スタンプを追加</h4>
    <filter-input
      v-model="filterState.query"
      placeholder="スタンプを検索"
      :class="$style.filterInput"
      @update:model-value="resetDisplayCount"
    />
    <div
      ref="addableStampListContainerRef"
      :class="$style.addableStampListContainer"
    >
      <div
        v-if="addableStampsSlice.length > 0"
        :class="$style.addableStampList"
      >
        <div
          v-for="stamp in addableStampsSlice"
          :key="stamp.id"
          :class="$style.addableStampListItem"
          @click="addStamp(stamp.id)"
        >
          <stamp-palette-editor-add-stamp-list-item :stamp="stamp" />
        </div>
        <div
          v-if="displayCount < allAddableStamps.length"
          ref="loadMoreTriggerRef"
          style="height: 1px"
        />
      </div>
      <div
        v-else-if="allAddableStamps.length === 0 && stampsMapFetched"
        :class="$style.emptyState"
      >
        追加できるスタンプがありません
      </div>
      <div v-else :class="$style.emptyState">スタンプを読み込み中...</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import StampPaletteEditorAddStampListItem from './StampPaletteEditorAddableStampListItem.vue'
import useStampFilter from '/@/components/Main/StampPicker/composables/useStampFilter'
import FilterInput from '/@/components/UI/FilterInput.vue'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStampsStore } from '/@/store/entities/stamps'
import type { StampId } from '/@/types/entity-ids'

const ITEMS_PER_LOAD = 50

const currentStampIds = defineModel<StampId[]>('current-stamp-ids', {
  required: true
})

const { stampsMap, stampsMapFetched } = useStampsStore()
const { recentStampIds, fetchStampHistory } = useStampHistory()
const { filterState } = useStampFilter()

const displayCount = ref(ITEMS_PER_LOAD)

fetchStampHistory()

const allAddableStamps = computed(() => {
  if (!stampsMapFetched.value) {
    return []
  }
  return (
    filterState.query === ''
      ? [
          ...recentStampIds.value
            .map(id => stampsMap.value.get(id))
            .filter(stamp => stamp !== undefined),
          ...filterState.filteredItems
            .filter(stamp => !recentStampIds.value.includes(stamp.id))
            .sort((a, b) => a.name.localeCompare(b.name))
        ]
      : filterState.filteredItems
  ).filter(stamp => !currentStampIds.value.includes(stamp.id))
})

const addableStampsSlice = computed(() => {
  return allAddableStamps.value.slice(0, displayCount.value)
})

const loadMoreTriggerRef = ref<HTMLElement | null>(null)
const addableStampListContainerRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const setupIntersectionObserver = () => {
  if (observer) {
    observer.disconnect()
  }

  if (addableStampListContainerRef.value && loadMoreTriggerRef.value) {
    const options = {
      root: addableStampListContainerRef.value,
      rootMargin: '0px',
      threshold: 0.0
    }
    observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        loadMoreStamps()
      }
    }, options)
    observer.observe(loadMoreTriggerRef.value)
  }
}

const loadMoreStamps = () => {
  if (displayCount.value < allAddableStamps.value.length) {
    displayCount.value += ITEMS_PER_LOAD
  }
}

const resetDisplayCount = () => {
  displayCount.value = ITEMS_PER_LOAD
}

watch(
  loadMoreTriggerRef,
  (currentLoadMoreTrigger, previousLoadMoreTrigger) => {
    if (currentLoadMoreTrigger) {
      if (addableStampListContainerRef.value) {
        setupIntersectionObserver()
      }
    } else if (previousLoadMoreTrigger && !currentLoadMoreTrigger) {
      if (observer) {
        observer.disconnect()
      }
    }
  },
  { flush: 'post' }
)

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

const addStamp = (stampId: StampId) => {
  if (currentStampIds.value.includes(stampId)) {
    return
  }
  currentStampIds.value.push(stampId)
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.addableStampListContainer {
  @include background-secondary;
  max-height: 400px;
  min-height: 400px;
  overflow-y: auto;
  border-radius: 4px;
}

.filterInput {
  @include background-secondary;
  border-radius: 4px;
  padding: 8px;
}

.addableStampList {
  border-radius: 4px;
}

.addableStampListItem {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    @include background-tertiary;
  }
}

.stampImageInList {
  flex-shrink: 0;
}

.stampNameContent {
  flex-grow: 1;
  margin-left: 8px;
  @include size-body2;
  word-break: break-all;
  white-space: normal;
}

.iconButton {
  @include color-ui-secondary;
}

.emptyState {
  text-align: center;
  @include color-text-secondary;
  padding: 16px;
  border-radius: 4px;
  width: 100%;
}
</style>
