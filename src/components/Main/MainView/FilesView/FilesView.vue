<template>
  <div :class="$style.container">
      <h1>あいうえお</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'FilesView',
  components: {
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
}
</style>