<template>
  <div ref="tabStrip" :class="$style.container">
    <div
      ref="tabList"
      :class="[$style.innerContainer, { [$style.dragging]: isDragging }]"
      role="group"
      aria-label="スタンプ一覧の切り替え"
      @contextmenu="onTabContextMenu"
    >
      <StampPickerStampSetSelectorItem
        v-for="set in stampSets"
        :key="getStampSetKey(set)"
        :class="$style.item"
        :data-id="getStampSetKey(set)"
        :stamp-set="set"
        :is-active="getStampSetKey(currentStampSet) === getStampSetKey(set)"
        @click="currentStampSet = set"
      />
    </div>
    <template v-if="sortable && tabOrder.length > 0">
      <span :class="$style.divider" aria-hidden="true" />
      <button
        ref="resetButton"
        type="button"
        title="タブの並び順をリセット"
        :class="$style.resetButton"
        :disabled="isDragging"
      >
        <AIcon mdi name="refresh" aria-hidden="true" />
      </button>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, useCssModule, useTemplateRef } from 'vue'

import { useEventListener } from '@vueuse/core'

import AIcon from '/@/components/UI/AIcon.vue'
import { useSortable } from '/@/composables/dom/useSortable'
import {
  type StampPickerTab,
  type StampSet,
  getStampSetKey
} from '/@/store/ui/stampPickerSettings'

import StampPickerStampSetSelectorItem from './StampPickerStampSetSelectorItem.vue'

const currentStampSet = defineModel<StampSet>('currentStampSet', {
  required: true
})

const tabOrder = defineModel<string[]>('tabOrder', { required: true })

const props = defineProps<{
  stampSets: StampPickerTab[]
  sortable: boolean
}>()

const TOUCH_REORDER_DELAY = 350
const tabStrip = useTemplateRef('tabStrip')
const tabList = useTemplateRef('tabList')
const styles = useCssModule()
const { isDragging } = useSortable(
  computed(() => (props.sortable ? tabList.value : null)),
  ids => {
    tabOrder.value = ids
  },
  {
    sortOutside: 'horizontal',
    scroll: tabStrip,
    delay: TOUCH_REORDER_DELAY,
    delayOnTouchOnly: true,
    // タッチの並べ替えが始まったら touchmove でブラウザーのスクロールを止める
    supportPointer: false,
    touchStartThreshold: 4,
    fallbackTolerance: 4,
    fallbackClass: styles.dragPreview
  }
)

const onTabContextMenu = (event: PointerEvent) => {
  if (props.sortable && event.pointerType === 'touch') event.preventDefault()
}

const resetButton = useTemplateRef('resetButton')

// 列外ドロップ後のクリックを SortableJS が抑制する前に処理する
useEventListener(
  () =>
    isDragging.value ? undefined : resetButton.value?.ownerDocument.defaultView,
  'click',
  event => {
    const button = resetButton.value
    if (!button || !event.composedPath().includes(button)) return

    tabOrder.value = []
    tabStrip.value?.scrollTo({ left: 0 })
  },
  { capture: true }
)
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  display: flex;
  align-items: center;
  position: relative;
  height: fit-content;
  padding-inline: 8px;
  overflow-x: auto;

  @media (pointer: coarse) {
    overscroll-behavior: none;
  }
}
.innerContainer {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.item,
.resetButton {
  flex: 0 0 32px;
}
.item {
  -webkit-touch-callout: none;
}
.divider {
  flex: 0 0 1px;
  height: 20px;
  margin-inline: 4px;
  background: $theme-ui-tertiary-default;
}
.resetButton {
  @include background-tertiary;
  @include color-ui-secondary;
  display: grid;
  place-items: center;
  height: 36px;
  cursor: pointer;

  &:hover {
    @include background-primary;
  }

  &:focus-visible {
    outline: 2px solid $theme-accent-focus-default;
    outline-offset: -2px;
  }
}
.dragging ~ .divider,
.dragging ~ .resetButton {
  visibility: hidden;
}
.dragPreview {
  visibility: hidden;
}
:global(html):has(.dragging),
:global(html):has(.dragging) * {
  cursor: grabbing !important;
}
</style>
