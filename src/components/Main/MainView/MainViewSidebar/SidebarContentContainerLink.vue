<template>
  <sidebar-content-container
    clickable
    :title="title"
    :large-padding="largePadding"
    @toggle="$emit('click-link')"
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
  emits: {
    'click-link': () => true
  },
  props: {
    title: String,
    count: Number,
    largePadding: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="scss" module>
.count {
  font-weight: normal;
}
</style>
