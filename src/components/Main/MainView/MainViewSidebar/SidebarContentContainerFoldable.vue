<template>
  <sidebar-content-container
    :title="title"
    :clickable="clickable || !isOpen"
    :large-padding="largePadding"
    @click="toggle"
  >
    <template #header-control>
      <icon
        width="20"
        height="20"
        :style="styles.icon"
        name="rounded-triangle"
        :class="$style.icon"
      />
    </template>
    <template v-if="isOpen" #default>
      <slot></slot>
    </template>
  </sidebar-content-container>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import SidebarContentContainer from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'

const useStyles = (state: { isOpen: boolean }) =>
  reactive({
    icon: makeStyles(theme => ({
      transform: state.isOpen ? 'rotate(180deg)' : ''
    }))
  })

export default defineComponent({
  name: 'SidebarContentContainerFoldable',
  components: {
    SidebarContentContainer,
    Icon
  },
  props: {
    title: String,
    largePadding: {
      type: Boolean,
      default: false
    },
    clickable: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const state = reactive({
      isOpen: false
    })
    const toggle = () => (state.isOpen = !state.isOpen)
    const styles = useStyles(state)
    return { styles, ...toRefs(state), toggle }
  }
})
</script>

<style lang="scss" module>
.container {
}
.icon {
  transform: rotate(0deg);
  transition: 0.5s;
}
</style>
