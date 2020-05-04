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
        name="rounded-triangle"
        :class="$style.icon"
        :data-is-open="isOpen"
      />
    </template>
    <template v-if="isOpen" #default>
      <slot></slot>
    </template>
  </sidebar-content-container>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'
import SidebarContentContainer from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'

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
    return { ...toRefs(state), toggle }
  }
})
</script>

<style lang="scss" module>
.icon {
  transform: rotate(0deg);
  &[data-is-open] {
    transform: rotate(180deg);
  }
  transition: 0.5s;
}
</style>
