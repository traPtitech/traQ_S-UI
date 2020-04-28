<template>
  <portal v-if="shouldShowSidebar" to="sidebar">
    <div :style="styles.container" :class="$style.container">
      <div :class="$style.header">
        <slot name="header" />
        <close-button @click="closeSidebar" :size="28" />
      </div>
      <slot name="content" />
    </div>
  </portal>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import useSidebar from '@/use/sidebar'
import CloseButton from '@/components/UI/CloseButton.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSidebar',
  components: { CloseButton },
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

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  flex-shrink: 0;
  height: 64px;
}
</style>
