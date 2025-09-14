<template>
  <ClickOutside @click-outside="close">
    <div :class="$style.container">
      <div :class="$style.header">
        <span :class="$style.title">サービス</span>
        <CloseButton
          :class="$style.close"
          :size="32"
          :border-width="2"
          @close="close"
        />
      </div>
      <div ref="containerRef" :class="$style.list">
        <AppListItem
          v-for="app in displayApps"
          :key="app.label"
          class="js-sortable-item"
          :data-id="app.label"
          :icon-path="app.iconPath"
          :label="app.label"
          :app-link="app.appLink"
        />

        <div
          :class="$style.resetButtonContainer"
          :style="{
            gridColumnStart: resetButtonGridColumnStart
          }"
        >
          <button :class="$style.resetButton" @click="resetOrder">
            並び順をリセット
          </button>
        </div>
      </div>
    </div>
  </ClickOutside>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import AppListItem from '/@/components/Main/NavigationBar/AppListItem.vue'
import ClickOutside from '/@/components/UI/ClickOutside'
import CloseButton from '/@/components/UI/CloseButton.vue'
import useGridLayout from '/@/composables/dom/useGridLayout'
import { useSortable } from '/@/composables/dom/useSortable'
import { isTouchDevice } from '/@/lib/dom/browser'
import { useAppList } from '/@/store/ui/appList'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { displayApps, resetToDefaultAppOrder, updateAppOrder } = useAppList()
const { containerRef } = useSortable({
  store: {
    set: sortable => {
      updateAppOrder(sortable.toArray())
    }
  },
  delay: isTouchDevice() ? 200 : 0
})
const { columnCount } = useGridLayout(containerRef, { columnCount: 0 })

const close = () => {
  emit('close')
}

const resetOrder = async () => {
  if (!confirm('本当にサービスの並び順をリセットしますか？')) return
  await resetToDefaultAppOrder()
}

const resetButtonGridColumnStart = computed(() => {
  if (!columnCount.value) return 'auto'
  return (displayApps.value.length % columnCount.value) + 1
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-primary;
  @include drop-shadow-default;
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 8px;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
}

.title {
  font-weight: bold;
}

.close {
  margin-left: auto;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  overflow: {
    x: hidden;
    y: auto;
  }
  scrollbar-gutter: stable;
}

.resetButtonContainer {
  display: flex;
  justify-content: end;
  align-items: end;
  grid-column-end: -1;
}

.resetButton {
  @include color-ui-secondary;
  @include background-secondary;

  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  width: 100%;
  margin-top: 12px;
  padding-top: 6px;
  padding-bottom: 6px;

  &:hover {
    @include color-ui-primary;
    @include background-tertiary;
  }
}
</style>
