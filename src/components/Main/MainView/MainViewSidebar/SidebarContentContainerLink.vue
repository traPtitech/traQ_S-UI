<template>
  <sidebar-content-container
    clickable
    :title="title"
    :large-padding="largePadding"
    @toggle="onClickLink"
  >
    <template #header-control v-if="count !== undefined">
      <span :class="$style.count">{{ count }}</span>
    </template>
    <template #default></template>
  </sidebar-content-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SidebarContentContainer from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'

export default defineComponent({
  name: 'SidebarContentContainerLink',
  components: {
    SidebarContentContainer
  },
  props: {
    title: String,
    count: Number,
    largePadding: {
      type: Boolean,
      default: false
    }
  },
  setup(_, context) {
    const onClickLink = () => context.emit('click-link')
    return { onClickLink }
  }
})
</script>

<style lang="scss" module>
.count {
  font-weight: normal;
}
</style>
