<template>
  <sidebar-header>
    <span :class="$style.text">@{{ name }}</span>
  </sidebar-header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SidebarHeader from '@/components/Main/MainView/MainViewSidebar/SidebarHeader.vue'

export default defineComponent({
  name: 'DMSidebarHeader',
  components: { SidebarHeader },
  props: {
    name: { type: String, required: true }
  }
})
</script>

<style lang="scss" module>
.text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
