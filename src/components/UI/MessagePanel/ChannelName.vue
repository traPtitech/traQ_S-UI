<template>
  <div :class="$style.path" :style="styles.path" :data-is-title="isTitle">
    {{ path }}
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

const useStyles = (props: { isTitle: boolean }) =>
  reactive({
    path: makeStyles(theme => ({
      color: props.isTitle ? theme.ui.primary : theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelName',
  props: {
    path: {
      type: String,
      required: true
    },
    isTitle: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const styles = useStyles(props)

    return { styles }
  }
})
</script>

<style lang="scss" module>
.path {
  @include body2-size;
  &[data-is-title] {
    @include body1-size;
    font-weight: bold;
  }
  &::before {
    content: '# ';
  }
}
</style>
