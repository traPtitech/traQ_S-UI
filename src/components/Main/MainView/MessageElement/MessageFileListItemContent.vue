<template>
  <router-link
    :to="fileLink"
    :class="$style.container"
    :data-is-white="$boolAttr(isWhite)"
  >
    <file-description
      :file-id="fileId"
      :is-white="isWhite"
      is-ellipsis
      :class="$style.description"
    />
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileMeta from '/@/composables/useFileMeta'
import FileDescription from '/@/components/UI/FileDescription.vue'

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
  setup(props) {
    const { fileLink } = useFileMeta(props)
    return { fileLink }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  &[data-is-white] {
    @include color-common-text-white-primary;
  }
  width: 100%;
}
.description {
  padding: 0 16px;
}
</style>
