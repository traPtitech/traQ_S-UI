<template>
  <div
    :class="$style.container"
    :data-is-disabled="$boolAttr(disabled)"
    :data-header-style="headerStyle"
    :data-hover-scale="$boolAttr(hoverScale)"
    :data-animation="animation"
    :title="tooltip"
    @click="onClick"
  >
    <AIcon :mdi="iconMdi" :name="iconName" />
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import { useMainViewStore } from '/@/store/ui/mainView'

const props = withDefaults(
  defineProps<{
    iconName: string
    iconMdi?: boolean
    disabled?: boolean
    tooltip?: string
    hoverScale?: boolean
    animation?: 'shake' | 'spinAndPress'
  }>(),
  {
    iconMdi: false,
    disabled: false,
    hoverScale: false
  }
)

const emit = defineEmits<{
  (e: 'click'): void
}>()

const { headerStyle } = useMainViewStore()
const onClick = () => {
  if (props.disabled) return
  emit('click')
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  padding: 8px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  &[data-hover-scale] {
    transition: transform 0.1s;
    &:hover {
      transform: scale(1.1);
    }
  }
  &[data-animation='shake'] {
    animation: shake 0.2s 2;
  }
  &[data-animation='spinAndPress'] {
    animation: spinAndPress 0.5s;
  }
  &[data-is-disabled] {
    @include color-ui-primary-inactive;
    cursor: not-allowed;
  }
  &[data-header-style='dark'] {
    @include color-common-text-white-primary;
  }
}

@keyframes shake {
  0% {
    transform: scale(1.1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(-10deg);
  }
  75% {
    transform: scale(1.1) rotate(10deg);
  }
  100% {
    transform: scale(1.1) rotate(0deg);
  }
}

@keyframes spinAndPress {
  0% {
    transform: scale(1.1) rotate(0deg);
  }
  60% {
    transform: scale(1.1) rotate(360deg);
  }
  80% {
    transform: scale(1.3) rotate(360deg);
  }
  100% {
    transform: scale(1.1) rotate(360deg);
  }
}
</style>
