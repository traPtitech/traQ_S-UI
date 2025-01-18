<template>
  <div
    ref="stampRoot"
    :class="$style.body"
    :aria-label="tooltip"
    :data-include-me="$boolAttr(includeMe)"
    @click="onClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <transition name="stamp-pressed" mode="out-in">
      <a-stamp
        :key="pressAnimationKey"
        :stamp-id="stamp.id"
        :size="20"
        without-title
      />
    </transition>
    <spin-number :value="stamp.sum" :class="$style.count" />
  </div>
  <stamp-scaled-element
    :class="$style.scaleReaction"
    :show="isHovered && isLongHovered && !isDetailShown"
    :stamp="stamp"
    :target-rect="hoveredRect"
  />
</template>

<script lang="ts" setup>
import SpinNumber from '/@/components/UI/SpinNumber.vue'
import AStamp from '/@/components/UI/AStamp.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { useStampsStore } from '/@/store/entities/stamps'
import type { MessageStampById } from '/@/lib/messageStampList'
import StampScaledElement from './StampScaledElement.vue'
import useHover from '/@/composables/dom/useHover'

const props = defineProps<{
  stamp: MessageStampById
  isDetailShown: boolean
}>()

const emit = defineEmits<{
  (e: 'addStamp', _stampId: string): void
  (e: 'removeStamp', _stampId: string): void
}>()

const { stampsMap } = useStampsStore()

const stampName = computed(
  () => stampsMap.value.get(props.stamp.id)?.name ?? ''
)

const tooltip = computed(() =>
  [
    `${stampName.value}, ${props.stamp.sum}件のリアクション, クリック／タップでリアクションを削除`
  ].join(' ')
)

const includeMe = computed(() => props.stamp.myCount > 0)

// この値が変わったときにアニメーションする
const pressAnimationKey = ref(0)
onMounted(() => {
  if (props.stamp.myCount > 0) {
    pressAnimationKey.value++
  }
})
watch(
  () => props.stamp.myCount,
  (newVal, oldVal) => {
    if (oldVal < newVal) {
      pressAnimationKey.value++
    }
  }
)

const isProgress = ref(false)

const onClick = () => {
  if (isProgress.value) return
  if (includeMe.value) {
    emit('removeStamp', props.stamp.id)
  } else {
    emit('addStamp', props.stamp.id)
  }
  isProgress.value = true
}
watch(
  () => props.stamp,
  () => {
    isProgress.value = false
  }
)

const { isHovered, onMouseEnter, onMouseLeave } = useHover()
const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const isLongHovered = ref(false)
const stampRoot = ref<HTMLElement | null>(null)
const hoveredRect = ref<DOMRect | undefined>(undefined)

watch(isHovered, beginHover => {
  if (beginHover) {
    hoveredRect.value = stampRoot.value?.getBoundingClientRect() ?? undefined
    hoverTimeout.value = setTimeout(() => {
      isLongHovered.value = true
    }, 500)
  } else {
    hoveredRect.value = undefined
    if (hoverTimeout.value) {
      clearTimeout(hoverTimeout.value)
      hoverTimeout.value = null
    }
    isLongHovered.value = false
  }
})
</script>

<style lang="scss" module>
.body {
  @include background-tertiary;
  &[data-include-me] {
    background: var(--specific-stamp-include-me-background);
  }
  display: inline-flex;
  flex-shrink: 0;
  height: 1.5rem;
  align-items: center;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  contain: content;
  position: relative;
}

.count {
  color: var(--specific-count-text);
  .body[data-include-me] &,
  .body:hover & {
    @include color-ui-primary;
  }
  @include size-body2;
  font-weight: bold;
  margin: {
    left: 6px;
    right: 4px;
  }
}

.scaleReaction {
  @include background-tertiary;
  display: flex;
  align-items: center;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  user-select: none;
  overflow: visible;
  contain: content;
  position: absolute;
  bottom: 105%;
  z-index: $z-index-message-element-scaled-stamp;
}
</style>
