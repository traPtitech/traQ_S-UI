<template>
  <router-link
    :to="fileLink"
    :class="$style.container"
    :data-is-white="$boolAttr(isWhite)"
  >
    <file-description
      :file-id="fileId"
      :is-white="isWhite"
      :is-ellipsis="true"
      :class="$style.description"
    />
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileMeta from '@/use/fileMeta'
import FileDescription from '@/components/UI/FileDescription.vue'

export default defineComponent({
  name: 'MessageFileListItemContent',
  components: { FileDescription },
  props: {
    fileId: {
      type: String,
      default: ''
    },
    isWhite: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const { fileLink } = useFileMeta(props)
    return {
      fileLink,
      props
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  &[data-is-white] {
    color: $common-text-white-primary;
  }
  width: 100%;
}
.description {
  padding: 0 16px;
}
</style>
