<template>
  <section :class="$style.container">
    <div :class="$style.content">
      <tab-content-title :class="$style.title" />
      <slot />
    </div>
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
  padding-right: 160px;
  overflow: {
    x: hidden;
    y: auto;
  }
}

.content {
  max-width: 720px;
  margin: 0 auto;
}

.title {
  margin-bottom: 40px;
}
</style>
