<template>
  <portal v-if="shouldShowSidebar" to="sidebar">
    <div :style="styles.container" :class="$style.container">
      <slot name="header" />
      <slot name="content" />
    </div>
  </portal>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import useSidebar from '@/use/sidebar'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBar',
  setup() {
    const styles = useStyles()
    const { closeSidebar } = useSidebar()

    const { shouldShowSidebar, isSidebarOpen, openSidebar } = useSidebar()
    return {
      styles,
      closeSidebar,

      shouldShowSidebar,
      isSidebarOpen,
      openSidebar
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  width: 320px;
  height: 100%;
  padding: 0 32px;
  overflow: auto;
}

.sidebarItem {
  margin-top: 16px;
}
</style>
