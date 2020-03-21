<template>
  <div :class="$style.container" :style="containerStyle">
    {{ props.name }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

type Props = { name: string }

export default defineComponent({
  name: 'UsersSeparator',
  props: { name: { type: String, default: '' } },
  setup(props: Props) {
    return {
      props,
      containerStyle: makeStyles(theme => ({
        borderColor: theme.ui.tertiary,
        color: theme.ui.secondary
      }))
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  &::after {
    content: '';
    display: block;
    margin-left: 8px;
    width: 100%;
    border-bottom: {
      style: solid;
      width: 2px;
      color: inherit;
    }
  }
}
</style>
