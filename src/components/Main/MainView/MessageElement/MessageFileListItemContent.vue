<template>
  <router-link
    :to="fileLink"
    :class="$style.container"
    :style="styles.container"
  >
    <file-description
      :file-id="props.fileId"
      :is-white="props.isWhite"
      :is-ellipsis="true"
      :class="$style.description"
    />
  </router-link>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import useFileMeta from '@/use/fileMeta'
import FileDescription from '@/components/UI/FileDescription.vue'

const useStyles = (props: { isWhite: boolean }) =>
  reactive({
    container: makeStyles((theme, common) => ({
      borderColor: theme.ui.secondary,
      color: props.isWhite ? common.text.whitePrimary : theme.ui.primary
    })),
    fileSize: makeStyles((theme, common) => ({
      color: props.isWhite ? common.text.whiteSecondary : theme.ui.secondary
    }))
  })

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
    const styles = useStyles(props)
    const { fileLink } = useFileMeta(props, context)
    return {
      styles,
      fileLink,
      props
    }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  padding: 12px 0;
}
.description {
  padding: 0 16px;
}
</style>
