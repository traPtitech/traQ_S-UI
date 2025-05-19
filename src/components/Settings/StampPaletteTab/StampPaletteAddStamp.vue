<template>
  <section :class="$style.section">
    <h3 :class="$style.sectionTitle">スタンプを追加</h3>
    <FilterInput v-model="searchQuery" placeholder="スタンプを検索" />
    <div ref="addStampListContainerRef" :class="$style.addStampListContainer">
      <div
        v-if="filteredAvailableStamps.length > 0"
        :class="$style.addStampList"
      >
        <div
          v-for="item in filteredAvailableStamps"
          :key="item.id"
          :class="$style.addStampListItem"
          @click="addStamp(item.id)"
        >
          <AStamp
            :stamp-id="item.id"
            :size="24"
            :class="$style.stampImageInList"
          />
          <span :class="$style.stampNameContent">{{ item.name }}</span>
          <IconButton icon-name="plus" icon-mdi :class="$style.iconButton" />
        </div>
        <div
          v-if="displayCount < _allFilteredAvailableStamps.length"
          ref="loadMoreTriggerRef"
          style="height: 1px"
        />
      </div>
      <div
        v-else-if="_allFilteredAvailableStamps.length === 0 && stampsMapFetched"
        :class="$style.emptyState"
      >
        追加できるスタンプがありません
      </div>
      <div v-else :class="$style.emptyState">スタンプを読み込み中...</div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import AStamp from '/@/components/UI/AStamp.vue'
import FilterInput from '/@/components/UI/FilterInput.vue'
import IconButton from '/@/components/UI/IconButton.vue'
import { useStampsStore } from '/@/store/entities/stamps'
import type { StampId } from '/@/types/entity-ids'

const ITEMS_PER_LOAD = 50

const currentStampIds = defineModel<StampId[]>('current-stamp-ids', {
  required: true
})

const { stampsMap, stampsMapFetched } = useStampsStore()
const searchQuery = ref('')
const displayCount = ref(ITEMS_PER_LOAD)

const _allFilteredAvailableStamps = computed(() => {
  if (!stampsMapFetched.value) {
    return []
  }
  const query = searchQuery.value.toLowerCase()

  return Array.from(stampsMap.value.values()).filter(stamp => {
    if (currentStampIds.value.includes(stamp.id)) {
      return false
    }
    if (query === '') {
      return true
    }
    const name = stamp.name.toLowerCase()
    return query.length === 1 ? name === query : name.includes(query)
  })
})

const filteredAvailableStamps = computed(() => {
  return _allFilteredAvailableStamps.value.slice(0, displayCount.value)
})

const loadMoreTriggerRef = ref<HTMLElement | null>(null)
const addStampListContainerRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const setupIntersectionObserver = () => {
  if (observer) {
    observer.disconnect()
  }

  if (addStampListContainerRef.value && loadMoreTriggerRef.value) {
    const options = {
      root: addStampListContainerRef.value,
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
  if (displayCount.value < _allFilteredAvailableStamps.value.length) {
    displayCount.value += ITEMS_PER_LOAD
  }
}

const resetDisplayCount = () => {
  displayCount.value = ITEMS_PER_LOAD
}

watch(searchQuery, resetDisplayCount)

watch(
  loadMoreTriggerRef,
  (currentLoadMoreTrigger, previousLoadMoreTrigger) => {
    if (currentLoadMoreTrigger) {
      if (addStampListContainerRef.value) {
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
@use '/@/styles/mixins';

.section {
  @include mixins.background-primary;
  border-radius: 8px;
  padding: 16px 0;
}

.sectionTitle {
  font-size: 18px;
  font-weight: bold;
}

.addStampListContainer {
  max-height: 400px;
  min-height: 400px;
  overflow-y: auto;
}

.addStampList {
  display: flex;
  flex-direction: column;
  border-radius: 4px;
}

.addStampListItem {
  display: flex;
  align-items: center;
  padding: 8px;
  @include mixins.background-secondary;
  cursor: pointer;

  &:hover {
    @include mixins.background-tertiary;
  }
}

.stampImageInList {
  flex-shrink: 0;
}

.stampNameContent {
  flex-grow: 1;
  margin-left: 8px;
  font-size: 14px;
  word-break: break-all;
  white-space: normal;
}

.iconButton {
  @include mixins.color-ui-secondary;
}

.emptyState {
  text-align: center;
  @include mixins.color-text-secondary;
  padding: 16px;
  border-radius: 4px;
  width: 100%;
}
</style>
