<template>
  <teleport to="#stamp-picker-popup">
    <div
      v-show="show"
      ref="containerEle"
      :class="$style.scaleReaction"
      :style="stylePosition"
    >
      <transition name="scale-reaction">
        <!-- sizeを46より大きくすると見切れる -->
        <a-stamp
          :key="stamp.id"
          :stamp-id="stamp.id"
          :size="50"
          :class="$style.stamp"
          without-title
        />
      </transition>
      <stamp-detail-element :class="$style.detail" :stamp="stamp" />
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import AStamp from '/@/components/UI/AStamp.vue'
import type { MessageStampById } from '/@/lib/messageStampList'
import StampDetailElement from './StampScaledDetailElement.vue'
const props = defineProps<{
  stamp: MessageStampById
  show: boolean
  targetRect?: DOMRect
}>()

const containerEle = ref<HTMLDivElement>()
const stylePosition = computed(() => {
  if (!props.targetRect) return { display: 'none' }
  return {
    top: `${props.targetRect.top}px`,
    left: `${props.targetRect.left + props.targetRect.width / 2 - 25}px`,
    transform: 'translateY(-105%) translateX(-30%)'
  }
})
</script>

<style lang="scss" module>
.scaleReaction {
  @include color-ui-tertiary;
  @include background-primary;
  display: flex;
  border-radius: 4px;
  max-width: 500px;
  align-items: center;
  contain: none;
  flex-wrap: wrap;
  border: solid 2px $theme-ui-tertiary-default;
  position: absolute;
  animation: transformAnimation 0.15s ease-in;
}

@keyframes transformAnimation {
  from {
    transform: translateY(-125%) translateX(-30%);
  }
  to {
    transform: translateY(-105%) translateX(-30%);
  }
}
.stamp {
  margin: {
    right: 0.2rem;
    bottom: 0.2rem;
  }
  display: flex;
}

.detail {
  color: var(--specific-count-text);
  @include color-ui-primary;
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  overflow: clip;
  margin: {
    left: 6px;
    right: 4px;
  }
}
</style>
