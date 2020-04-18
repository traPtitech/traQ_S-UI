<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

const useStyles = (props: { isActive: boolean; hideOuter: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      opacity: props.isActive ? '1' : '0.5',
      overflow: props.hideOuter ? '' : 'hidden'
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
</style>
