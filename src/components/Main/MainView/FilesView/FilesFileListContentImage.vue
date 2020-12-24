<template>
  <img
    src="https://q.trap.jp/api/v3/public/icon/hosshii"
    :class="$style.image"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'FilesFileListContentImage',
  components: {}
})
</script>

<style lang="scss" module>
.image {
  width: 100%;
  object-fit: cover;
}
</style>
