<template>
  <teleport to="#scaled-stamp-popup">
    <div
      v-if="show"
      ref="containerEle"
      :class="$style.scaleReaction"
      :style="stylePosition"
    >
      <transition name="scale-reaction">
        <a-stamp
          :key="stamp.id"
          :stamp-id="stamp.id"
          :size="104"
          :class="$style.stamp"
          without-title
        />
      </transition>
      <span :class="$style.stampname">{{ `:${stampName}:` }}</span>
      <stamp-detail-element :class="$style.detail" :stamp="stamp" />
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import AStamp from '/@/components/UI/AStamp.vue'
import type { MessageStampById } from '/@/lib/messageStampList'
import { useStampsStore } from '/@/store/entities/stamps'
import StampDetailElement from './StampScaledDetailElement.vue'
const props = defineProps<{
  stamp: MessageStampById
  show: boolean
  targetRect?: DOMRect
}>()

const containerEle = ref<HTMLDivElement>()
const { stampsMap } = useStampsStore()
const stampName = computed(
  () => stampsMap.value.get(props.stamp.id)?.name ?? ''
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
</script>

<style lang="scss" module>
.scaleReaction {
  @include color-ui-tertiary;
  @include background-primary;
  border-radius: 4px;
  max-width: 49.6rem;
  contain: none;
  border: solid 2px $theme-ui-tertiary-default;
  position: absolute;
  animation: transformAnimation 0.15s ease-in;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    'stamp stampname'
    'stamp detail';
  align-items: center;
  margin: 0.5rem;
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
  grid-area: stamp;
  margin: 0.5rem;
  width: 6.5rem;
  height: 6.5rem;
  display: flex;
  justify-self: center;
}

.stampname {
  grid-area: stampname;
  color: var(--specific-count-text);
  @include color-ui-primary;
  margin: 0.5rem;
  justify-self: center;
}

.detail {
  grid-area: detail;
  color: var(--specific-count-text);
  @include color-ui-primary;
  overflow: hidden;
  overflow: clip;
  margin: 0.5rem;
}
</style>
