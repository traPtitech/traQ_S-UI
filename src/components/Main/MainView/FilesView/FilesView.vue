<template>
  <div :class="$style.container">
    <files-view-content />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FilesViewContent from './FilesViewContent.vue'

export default defineComponent({
  name: 'FilesView',
  components: {
    FilesViewContent
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
}
</style>
