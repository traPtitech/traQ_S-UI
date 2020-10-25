<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <slot name="header" />
      <close-button @close="closeSidebar" :size="28" />
    </div>
    <div :class="$style.content">
      <slot name="content" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useSidebar from '@/use/sidebar'
import CloseButton from '@/components/UI/CloseButton.vue'

export default defineComponent({
  name: 'MainViewSidebarPage',
  components: { CloseButton },
  setup() {
    const { closeSidebar } = useSidebar()

    return { closeSidebar }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  @include color-ui-secondary;
  display: flex;
  flex-direction: column;
  width: 320px;
  height: 100%;
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
  padding: 0 32px;
}

.content {
  height: 100%;
  padding: 32px;
  padding-top: 0;
  overflow: {
    x: hidden;
    y: auto;
  }
}
</style>
