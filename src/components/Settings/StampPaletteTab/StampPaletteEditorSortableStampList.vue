<template>
  <section :class="$style.section">
    <h3 :class="$style.sectionTitle">スタンプを並び替え・削除</h3>
    <p :class="$style.sectionDescription">
      先頭のスタンプがアイコンとして使用されます
    </p>
    <div
      v-if="stampIdsModel.length !== 0"
      ref="stampListRef"
      :class="$style.stampList"
    >
      <div
        v-for="stampId in stampIdsModel"
        :key="stampId"
        :class="[
          $style.stampListItem,
          { [$style.selected]: selectedStampIds.includes(stampId) }
        ]"
        :data-id="stampId"
        @click="toggleStampSelection(stampId)"
      >
        <AStamp :stamp-id="stampId" :size="24" />
      </div>
      <IconButton
        :disabled="selectedStampIds.length === 0"
        icon-name="delete"
        icon-mdi
        :class="$style.deleteButton"
        @click="removeSelectedStamps"
      />
    </div>
    <div v-else :class="$style.emptyState">スタンプがありません</div>
  </section>
</template>

<script lang="ts" setup>
import Sortable, { type SortableEvent } from 'sortablejs'
import { onMounted, onUnmounted, ref } from 'vue'
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

onMounted(() => {
  if (stampListRef.value) {
    sortableInstance = Sortable.create(stampListRef.value, {
      animation: 150,
      onUpdate: (event: SortableEvent) => {
        if (
          event.newDraggableIndex === undefined ||
          event.oldDraggableIndex === undefined
        )
          return
        const newStamps = [...stampIdsModel.value]
        const movedItem = newStamps.splice(event.oldDraggableIndex, 1)[0]
        if (movedItem === undefined) return
        newStamps.splice(event.newDraggableIndex, 0, movedItem)
        stampIdsModel.value = newStamps
      }
    })
  }
})

onUnmounted(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
  }
})
</script>

<style lang="scss" module>
.section {
  @include background-primary;
  border-radius: 8px;
  padding: 16px 0;
}

.sectionTitle {
  font-size: 18px;
  font-weight: bold;
}

.sectionDescription {
  font-size: 14px;
  @include color-text-secondary;
}

.stampList {
  @include background-secondary;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
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
  padding: 16px;
  border-radius: 4px;
  width: 100%;
}
</style>
