<template>
  <div :class="$style.container" :style="styles.container">
    <file-modal-content-header :file-id="fileMeta.id" :class="$style.header" />
    <audio
      controls
      :alt="fileMeta.name"
      :src="fileRawPath"
      :class="$style.audio"
    />
    <file-modal-content-footer :file-id="fileMeta.id" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'

import { makeStyles } from '@/lib/styles'
import useFileMeta from '@/use/fileMeta'
import FileModalContentHeader from '@/components/Main/Modal/FileModal/FileModalContentHeader.vue'
import FileModalContentFooter from '@/components/Main/Modal/FileModal/FileModalContentFooter.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      backgroundColor: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'FileModalAudio',
  components: {
    FileModalContentHeader,
    FileModalContentFooter
  },
  props: {
    fileId: {
      type: String,
      required: true
    }
  },
  setup(props, context) {
    const styles = useStyles()
    const { fileMeta, fileRawPath } = useFileMeta(props, context)
    return { styles, fileMeta, fileRawPath }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  width: 100vw;
  max-width: 40rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 12px 16px;
}
.audio {
  margin: 16px 0;
  width: 80%;
}
</style>
