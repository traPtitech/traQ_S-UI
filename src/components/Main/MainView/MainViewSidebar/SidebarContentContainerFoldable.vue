<template>
  <sidebar-content-container
    :title="title"
    :clickable="!isOpen"
    title-clickable
    :large-padding="largePadding"
    @toggle="toggle"
  >
    <template #header-control>
      <icon
        width="20"
        height="20"
        name="rounded-triangle"
        :class="$style.icon"
        :data-is-open="$boolAttr(isOpen)"
      />
    </template>
    <template #default>
      <slide-down :is-open="isOpen">
        <slot />
      </slide-down>
    </template>
  </sidebar-content-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import SidebarContentContainer from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import Icon from '/@/components/UI/Icon.vue'
import SlideDown from '/@/components/UI/SlideDown.vue'

export default defineComponent({
  name: 'SidebarContentContainerFoldable',
  components: {
    SidebarContentContainer,
    Icon,
    SlideDown
  },
  props: {
    title: {
      type: String,
      default: undefined
    },
    largePadding: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const isOpen = ref(false)
    const toggle = () => {
      isOpen.value = !isOpen.value
    }

    return { isOpen, toggle }
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
