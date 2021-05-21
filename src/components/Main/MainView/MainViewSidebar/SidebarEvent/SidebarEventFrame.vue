<template>
  <div :class="$style.container" :data-show-chevron="showChevron">
    <div :class="$style.header">
      <icon :name="iconName" :mdi="iconMdi" />
      <div :class="$style.title">{{ title }}</div>
      <icon v-if="showChevron" name="chevron-right" mdi />
    </div>
    <div :class="$style.separator" />
    <div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'SidebarEventFrame',
  components: {
    Icon
  },
  props: {
    title: {
      type: String,
      required: true
    },
    iconName: {
      type: String,
      required: true
    },
    iconMdi: {
      type: Boolean,
      default: false
    },
    showChevron: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  padding: 8px 20px;
  border-radius: 4px;
  &[data-show-chevron] {
    cursor: pointer;
  }
}
.header {
  @include color-ui-primary;
  display: flex;
  align-items: center;
  font-weight: bold;
}
.title {
  flex: 1;
  margin: 0 4px;
}
.separator {
  @include background-secondary;
  width: 100%;
  height: 2px;
  margin: 4px 0;
}
</style>
