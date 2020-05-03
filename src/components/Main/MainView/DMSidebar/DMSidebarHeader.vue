<template>
  <div :class="$style.container" :style="styles.container">
    <h2 :class="$style.header">@{{ name }}</h2>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'

import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'DMSidebarHeader',
  props: {
    name: { type: String, required: true }
  },
  setup(props) {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 100%;
  width: calc(100% - 32px);
  display: flex;
  align-items: center;
}
.icon {
  margin-right: 16px;
  flex-shrink: 0;
}
.header {
  @include font-size-large;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
