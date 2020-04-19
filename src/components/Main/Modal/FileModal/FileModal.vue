<template>
  <div :class="$style.wrapper">
    <file-modal-image v-if="fileType === 'image'" :file-id="fileMeta.id" />
    <div v-else>
      <button :class="$style.close" @click="onClickClear">X</button>
      {{ fileMeta.name }}
      {{ channelPath }}
      {{ fileMeta.createdAt }}
      {{ user.name }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import useFileMeta from '@/use/fileMeta'
import FileModalImage from '@/components/Main/Modal/FileModal/FileModalImage.vue'
import useChannelPath from '@/use/channelPath'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'FileModal',
  components: {
    FileModalImage
  },
  props: {
    fileId: {
      type: String,
      required: true
    }
  },
  setup(props, context) {
    const styles = useStyles()

    store.dispatch.entities.fetchFileMetaByFileId(props.fileId)
    const { fileMeta, fileType } = useFileMeta(props, context)
    const channelPath = useChannelPath().channelIdToPathString(
      fileMeta.value?.channelId ?? '',
      true
    )

    const user = store.state.entities.users[fileMeta.value?.uploaderId ?? '']

    const onClickClear = () => store.dispatch.ui.modal.clearModal()
    return { styles, fileMeta, fileType, channelPath, user, onClickClear }
  }
})
</script>

<style lang="scss" module>
.wrapper {
}
.close {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}
</style>
