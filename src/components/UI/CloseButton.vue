<template>
  <button
    :class="$style.container"
    :data-react-hover="$boolAttr(reactHover)"
    :data-is-white="$boolAttr(isWhite)"
  >
    <div :class="$style.circle" :style="styles.circle" @click="onClick"></div>
    <span v-if="withText" :class="$style.text">閉じる</span>
  </button>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from 'vue'

const useStyles = (props: {
  borderWidth: number
  size: number
  innerSize: number
  iconWidth: number
}) =>
  reactive({
    circle: computed(() => ({
      borderWidth: `${props.borderWidth}px`,
      width: `${props.size}px`,
      height: `${props.size}px`,
      '--innerSize': `${props.innerSize}px`,
      '--iconWidth': `${props.iconWidth}px`
    }))
  })

export default defineComponent({
  name: 'CloseButton',
  props: {
    withText: { type: Boolean, default: false },
    borderWidth: { type: Number, default: 2 },
    iconWidth: { type: Number, default: 2 },
    size: { type: Number, required: true },
    innerSize: { type: Number, default: 16 },
    isWhite: { type: Boolean, default: false },
    reactHover: { type: Boolean, default: true }
  },
  emits: {
    close: () => true
  },
  setup(props, { emit }) {
    const styles = useStyles(props)

    const onClick = () => {
      emit('close')
    }
    return { styles, onClick }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include size-body2;
  text-align: center;
  font-weight: bold;
  opacity: 0.5;
  &:hover,
  &:not([data-react-hover]) {
    opacity: 1;
  }
  &[data-is-white] {
    @include color-common-text-black;
  }
}

.circle {
  @include color-ui-secondary;
  position: relative;
  border: {
    style: solid;
    color: $theme-ui-secondary;
    radius: 50%;
  }
  cursor: pointer;
  &[data-is-white] {
    border-color: transparent;
    background-color: $common-text-white-primary;
  }
  &::before,
  &::after {
    content: '';
    display: block;
    width: var(--innerSize);
    height: var(--iconWidth);
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: center;
    background: $theme-ui-secondary;
  }
  &::before {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
  &::after {
    transform: translate(-50%, -50%) rotate(45deg);
  }
}

.text {
  display: block;
  margin-top: 8px;
}
</style>
