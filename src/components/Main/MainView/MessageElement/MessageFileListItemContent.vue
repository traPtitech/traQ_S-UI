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

<script lang="ts" setup>
import FileDescription from '/@/components/UI/FileDescription.vue'
import useFileMeta from '/@/composables/files/useFileMeta'

const props = withDefaults(
  defineProps<{
    fileId?: string
    isWhite?: boolean
  }>(),
  {
    fileId: '',
    isWhite: false
  }
)

const { fileLink } = useFileMeta(props)
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
