<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.header" @click="onClick">
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
  setup(_, context) {
    const styles = useStyles()
    const onClick = () => {
      context.emit('click')
    }
    return { styles, onClick }
  }
})
</script>

<style lang="scss" module>
$headerSize: 1rem;

.container {
  display: flex;
  flex-direction: column;
  width: 256px;
  border-radius: 4px;
  padding: 12px;
  flex-shrink: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  &:last-child {
    margin-bottom: 0;
  }
}

.headerTitle {
  font-weight: bold;
  font-size: $headerSize;
}
</style>
