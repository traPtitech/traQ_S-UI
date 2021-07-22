<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <icon
        v-if="showBackButton"
        :size="28"
        mdi
        name="chevron-left"
        :class="$style.backButton"
        @click="$emit('back')"
      />
      <slot name="header" />
      <close-button :size="28" @close="closeSidebar" />
    </div>
    <div :class="$style.content">
      <slot name="content" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useSidebar from '/@/use/sidebar'
import Icon from '/@/components/UI/Icon.vue'
import CloseButton from '/@/components/UI/CloseButton.vue'

export default defineComponent({
  name: 'MainViewSidebarPage',
  components: { Icon, CloseButton },
  props: {
    showBackButton: {
      type: Boolean,
      default: false
    }
  },
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

.backButton {
  flex-shrink: 0;
  margin-right: 8px;
  cursor: pointer;
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
