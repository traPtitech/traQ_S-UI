<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.container" :style="styles.container">
      <div :class="$style.header" :style="styles.header">
        <file-modal-content-header :file-id="fileMeta.id" :is-white="true" />
      </div>
      <video
        controls
        draggable="false"
        :alt="fileMeta.name"
        :src="fileRawPath"
      />
      <div :class="$style.footer" :style="styles.footer">
        <file-modal-content-footer :file-id="fileMeta.id" :is-white="true" />
      </div>
    </div>
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
    container: makeStyles((theme, common) => ({
      backgroundColor: common.background.black
    }))
  })

export default defineComponent({
  name: 'FileModalVideo',
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
  width: 100vw;
  height: 100vh;
  max-height: 100%;
  max-width: 60rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  video {
    display: block;
    max-width: 100%;
    max-height: calc(100% - 128px);
  }
}
.header {
  width: 100%;
  backdrop-filter: blur(4px);
  z-index: 1;
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;

  .container:hover & {
    opacity: 1;
  }
}
.footer {
  width: 100%;
  backdrop-filter: blur(4px);
  z-index: 1;
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;

  .container:hover & {
    opacity: 1;
  }
}
</style>
