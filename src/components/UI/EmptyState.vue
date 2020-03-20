<template>
  <div :class="$style.container" :style="containerStyle">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

type Props = {}

export default defineComponent({
  name: 'EmptyState',
  setup(props: Props) {
    return {
      containerStyle: makeStyles(theme => ({
        color: theme.ui.tertiary
      }))
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 5rem;
  padding-bottom: 5rem;
}
</style>
