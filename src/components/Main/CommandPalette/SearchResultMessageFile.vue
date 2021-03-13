<template>
  <div :class="$style.container">
    <file-type-icon :type="fileType" :size="24" :class="$style.icon" />
    <div :class="$style.name">{{ name }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import useFileMeta from '@/use/fileMeta'
import FileTypeIcon from '@/components/UI/FileTypeIcon.vue'

export default defineComponent({
  name: 'SearchResultMessageFile',
  components: {
    FileTypeIcon
  },
  props: {
    fileId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { fileType, fileMeta } = useFileMeta(props)
    const name = computed(() => fileMeta.value?.name ?? 'unknown')
    return { fileType, name }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: grid;
  grid-template-columns: 1.5rem max-content;
  column-gap: 1rem;
  padding: 0.5rem 1rem;
  border: 2px solid $theme-ui-secondary;
  border-radius: 4px;
  overflow: hidden;
}
</style>
