<template>
  <div :class="$style.container">
    <files-file-list />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FilesFileList from './FilesFileList.vue'

export default defineComponent({
  components: { FilesFileList },
  name: 'FilesViewContent'
})
</script>

<style lang="scss" module>
.container {
}
</style>
