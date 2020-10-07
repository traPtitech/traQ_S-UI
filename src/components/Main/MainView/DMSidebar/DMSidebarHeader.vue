<template>
  <div :class="$style.container">
    <h2 :class="$style.header">@{{ name }}</h2>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DMSidebarHeader',
  props: {
    name: { type: String, required: true }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  height: 100%;
  width: calc(100% - 32px);
  display: flex;
  align-items: center;
}
.icon {
  margin-right: 16px;
  flex-shrink: 0;
}
.header {
  @include size-h2;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
