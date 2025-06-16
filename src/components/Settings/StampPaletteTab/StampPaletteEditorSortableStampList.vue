<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <h4>スタンプを並び替え・削除</h4>
      <p :class="$style.description">
        先頭のスタンプがアイコンとして使用されます
      </p>
    </div>
    <div
      v-if="stampIdsModel.length !== 0"
      ref="stampListRef"
      :class="$style.stampList"
    >
      <!-- FIXME: スタンプの総数が多い時に重くなる -->
      <div
        v-for="stampId in stampIdsModel"
        :key="stampId"
        :class="[
          $style.stampListItem,
          'js-sortable-item',
          { [$style.selected]: selectedStampIds.includes(stampId) }
        ]"
        :data-id="stampId"
        @click="toggleStampSelection(stampId)"
      >
        <a-stamp :stamp-id="stampId" :size="24" />
      </div>
      <icon-button
        :disabled="selectedStampIds.length === 0"
        icon-name="delete"
        icon-mdi
        :class="$style.deleteButton"
        @click="removeSelectedStamps"
      />
    </div>
    <div v-else :class="$style.emptyState">スタンプを追加してください</div>
    <stamp-palette-editor-limit-indicator
      :current-count="stampIdsModel.length"
      :limit="STAMP_PALETTE_STAMPS_LIMIT"
      :class="$style.stampCount"
    />
  </div>
</template>

<script lang="ts" setup>
import Sortable, { type SortableEvent } from 'sortablejs'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import StampPaletteEditorLimitIndicator from './StampPaletteEditorLimitIndicator.vue'
import { STAMP_PALETTE_STAMPS_LIMIT } from './utils'
import AStamp from '/@/components/UI/AStamp.vue'
import IconButton from '/@/components/UI/IconButton.vue'
import type { StampId } from '/@/types/entity-ids'

const stampIdsModel = defineModel<StampId[]>('stamp-ids', { required: true })

const selectedStampIds = ref<StampId[]>([])

const toggleStampSelection = (stampId: StampId) => {
  if (selectedStampIds.value.includes(stampId)) {
    selectedStampIds.value = selectedStampIds.value.filter(id => id !== stampId)
  } else {
    selectedStampIds.value.push(stampId)
  }
}

const removeSelectedStamps = () => {
  stampIdsModel.value = stampIdsModel.value.filter(
    id => !selectedStampIds.value.includes(id)
  )
  selectedStampIds.value = []
}

const stampListRef = ref<HTMLElement | null>(null)
let sortableInstance: Sortable | null = null

const setupSortable = () => {
  if (sortableInstance) return
  if (!stampListRef.value) return
  if (stampIdsModel.value.length === 0) return

  sortableInstance = Sortable.create(stampListRef.value, {
    animation: 150,
    draggable: '.js-sortable-item',
    onUpdate: (event: SortableEvent) => {
      if (
        event.newDraggableIndex === undefined ||
        event.oldDraggableIndex === undefined
      )
        return
      const newStampIds = [...stampIdsModel.value]
      const movedStampId = newStampIds.splice(event.oldDraggableIndex, 1)[0]
      if (movedStampId === undefined) return
      newStampIds.splice(event.newDraggableIndex, 0, movedStampId)
      stampIdsModel.value = newStampIds
    }
  })
}

const destroySortableInstance = () => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

onMounted(setupSortable)
onUnmounted(destroySortableInstance)
watch(
  () => stampIdsModel.value.length,
  (newLength, oldLength) => {
    if (newLength > 0 && oldLength === 0) {
      nextTick(setupSortable)
    } else if (newLength === 0 && oldLength > 0) {
      destroySortableInstance()
    }
  }
)
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.description {
  @include size-body2;
  @include color-text-secondary;
}

.stampList {
  @include background-secondary;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  border-radius: 4px;
}

.stampListItem {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: grab;

  &:hover {
    @include background-tertiary;
  }

  &.selected {
    background: var(--specific-stamp-include-me-background);
  }
}

.deleteButton {
  @include color-ui-primary;
  margin: auto 8px 8px auto;

  &[aria-disabled='true'] {
    @include color-ui-tertiary;
  }
}

.emptyState {
  @include background-secondary;
  text-align: center;
  @include color-text-secondary;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
}

.stampCount {
  text-align: right;
}
</style>
