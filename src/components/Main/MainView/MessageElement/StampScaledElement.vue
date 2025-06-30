<template>
  <teleport to="#scaled-stamp-popup">
    <div
      v-if="show || isHovered"
      ref="containerEle"
      :class="$style.scaleReaction"
      :style="stylePosition"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <transition name="scale-reaction">
        <a-stamp
          :key="stamp.id"
          :stamp-id="stamp.id"
          :size="48"
          :class="$style.stamp"
          without-title
        />
      </transition>
      <span :class="$style.stampname">{{ `:${stampName}:` }}</span>
      <stamp-detail-element
        :class="$style.detail"
        :stamp="stamp"
        @click-user="emit('end-scaled-hover')"
      />
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import useHover from '/@/composables/dom/useHover'
import AStamp from '/@/components/UI/AStamp.vue'
import type { MessageStampById } from '/@/lib/messageStampList'
import { useStampsStore } from '/@/store/entities/stamps'
import StampDetailElement from './StampScaledDetailElement.vue'
const props = defineProps<{
  stamp: MessageStampById
  show: boolean
  targetRect?: DOMRect
}>()

const emit = defineEmits<{
  (e: 'scaled-hover'): void
  (e: 'end-scaled-hover'): void
}>()

const containerEle = ref<HTMLDivElement>()
const { stampsMap } = useStampsStore()
const stampName = computed(
  () => stampsMap.value.get(props.stamp.id)?.name ?? 'unknown stamp'
)
const stylePosition = computed(() => {
  if (!props.targetRect) return { display: 'none' }
  const width = 340
  return {
    top: `${props.targetRect.top}px`,
    left: `min(calc(100% - ${width}px), ${props.targetRect.left}px)`,
    transform: 'translateY(-105%) translateX(-30%)'
  }
})

const { isHovered, onMouseEnter, onMouseLeave } = useHover()
watch(isHovered, newIsHovered => {
  if (newIsHovered) {
    emit('scaled-hover')
  } else {
    emit('end-scaled-hover')
  }
})
</script>

<style lang="scss" module>
.scaleReaction {
  @include color-ui-tertiary;
  @include background-primary;
  border-radius: 4px;
  max-width: 30.3rem;
  contain: none;
  border: solid 2px $theme-ui-tertiary-default;
  position: absolute;
  display: grid;
  row-gap: 0.3rem;
  column-gap: 0.5rem;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    'stamp stampname'
    'stamp detail';
  align-items: center;
  padding: 0.5rem;
}

.stamp {
  grid-area: stamp;
  width: 6.5rem;
  height: 6.5rem;
  display: flex;
  justify-self: center;
}

.stampname {
  grid-area: stampname;
  color: var(--specific-count-text);
  @include color-ui-primary;
}

.detail {
  grid-area: detail;
  color: var(--specific-count-text);
  @include color-ui-primary;
  overflow: hidden;
  overflow: clip;
}
</style>
