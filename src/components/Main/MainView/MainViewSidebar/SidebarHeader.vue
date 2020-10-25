<template>
  <div :class="$style.container">
    <icon
      v-if="showBackButton"
      :height="28"
      :width="28"
      mdi
      name="chevron-left"
      @click="$emit('back')"
      :class="$style.backButton"
    />
    <h2 :class="$style.title">
      <slot />
    </h2>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'SidebarHeader',
  components: {
    Icon
  },
  props: {
    showBackButton: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  // <h2>の中のellipsis用
  min-width: 0;
}
.backButton {
  flex-shrink: 0;
  margin-right: 8px;
  cursor: pointer;
}
.title {
  @include color-ui-primary;
  @include size-h2;
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
}
</style>
