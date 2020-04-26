<template>
  <sidebar-content-container
    clickable
    :title="title"
    :large-padding="largePadding"
    @click="onClick"
  >
    <template #header-control v-if="count !== undefined">
      <span :class="$style.count">{{ count }}</span>
    </template>
    <template #default></template>
  </sidebar-content-container>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
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
    const onClick = () => context.emit('click')
    return { onClick }
  }
})
</script>

<style lang="scss" module>
.count {
  font-weight: normal;
}
</style>
