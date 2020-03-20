<template>
  <div :class="$style.container" :style="styles.container">
    {{ props.name }}
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

type Props = { name: string }

export default defineComponent({
  name: 'ActivityElementChannelName',
  props: {
    name: {
      type: String,
      default: ''
    }
  },
  setup(props: Props, context: SetupContext) {
    const styles = reactive({
      container: makeStyles(theme => ({
        color: theme.ui.secondary
      }))
    })
    return {
      props,
      styles
    }
  }
})
</script>

<style lang="scss" module>
.container {
  font-size: 1.125rem;
  font-weight: bold;
  &::before {
    content: '# ';
  }
}
</style>
