<template>
  <div :class="$style.container">
    <span v-for="id in props.fileIds" :key="id">{{ id }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import { FileId } from '@/types/entity-ids'

interface Props {
  fileIds: FileId[]
}

export default defineComponent({
  name: 'MessageFileList',
  props: {
    fileIds: {
      type: Array,
      default: []
    }
  },
  setup(props: Props) {
    return { props }
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
