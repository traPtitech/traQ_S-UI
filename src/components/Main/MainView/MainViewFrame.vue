<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.body" :style="styles.body">
      <slot></slot>
      <div :class="$style.overlay" :style="styles.overlay"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

const useStyles = (props: { hideOuter: boolean; dimInner: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      opacity: props.hideOuter ? '0.5' : '1',
      overflow: props.hideOuter ? 'hidden' : ''
    })),
    overlay: makeStyles((theme, common) => ({
      opacity: props.dimInner ? '1' : '0',
      background: common.background.overlay
    }))
  })

export default defineComponent({
  name: 'MainViewFrame',
  props: {
    isActive: {
      type: Boolean,
      default: true
    },
    hideOuter: {
      type: Boolean,
      default: false
    },
    dimInner: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const styles = useStyles(props)
    return { styles }
  }
})
</script>

<style lang="scss" module>
$paddingSize: 16px;
.container {
  position: relative;
  width: 100%;
  margin: $paddingSize 0;
  border-radius: 4px;
  transition: opacity 0.3s ease;
}
.body {
  height: calc(100% + #{$paddingSize * 2});
  width: 100%;
  margin: -$paddingSize 0;
}
.overlay {
  position: absolute;
  height: calc(100% + #{$paddingSize * 2});
  width: 100%;
  top: -$paddingSize;
  left: 0;
  transition: opacity 0.3s ease;
}
</style>
