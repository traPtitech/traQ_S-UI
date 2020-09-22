<template>
  <button
    :class="$style.container"
    :data-react-hover="$boolAttr(reactHover)"
    :data-is-white="$boolAttr(props.isWhite)"
  >
    <div @click="onClick" :class="$style.circle" :style="styles.circle">
      <icon name="close" mdi />
    </div>
    <span :class="$style.text" v-if="props.withText">閉じる</span>
  </button>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from 'vue'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (props: { borderWidth: number; size: number }) =>
  reactive({
    circle: computed(() => ({
      borderWidth: `${props.borderWidth}px`,
      width: `${props.size}px`,
      height: `${props.size}px`
    }))
  })

export default defineComponent({
  name: 'CloseButton',
  props: {
    withText: { type: Boolean, default: false },
    borderWidth: { type: Number, default: 2 },
    size: { type: Number, required: true },
    isWhite: { type: Boolean, default: false },
    reactHover: { type: Boolean, default: true }
  },
  setup(props, context) {
    const styles = useStyles(props)

    const onClick = () => {
      context.emit('click')
    }
    return { styles, onClick, props }
  },
  components: {
    Icon
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
  display: flex;
  justify-content: center;
  align-items: center;
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
}

.text {
  display: block;
  margin-top: 8px;
}
</style>
