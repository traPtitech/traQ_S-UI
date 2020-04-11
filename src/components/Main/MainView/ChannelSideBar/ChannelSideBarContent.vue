<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.header">
      <h2 :class="$style.headerTitle">{{ title }}</h2>
      <slot name="header-control"></slot>
    </div>
    <slot name="content" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarContent',
  props: { title: { type: String, required: true } },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
$headerSize: 1.15rem;

.container {
  display: flex;
  flex-direction: column;
  width: 256px;
  border-radius: 4px;
  padding: 0 8px;
  padding-bottom: 8px;
  flex-shrink: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.headerTitle {
  font-weight: bold;
  font-size: $headerSize;
  min-height: 48px;
  line-height: 48px;
  cursor: pointer;
}
</style>
