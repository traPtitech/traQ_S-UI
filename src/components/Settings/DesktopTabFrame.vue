<template>
  <section :class="$style.container">
    <tab-content-title :class="$style.title" />
    <slot />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TabContentTitle from './TabContentTitle.vue'

export default defineComponent({
  name: 'DesktopTabFrame',
  components: {
    TabContentTitle
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-primary;
  flex: 1 1;
  padding: 40px;
  padding-right: 240px;
  overflow: {
    x: hidden;
    y: auto;
  }
}

.title {
  margin-bottom: 40px;
}
</style>
