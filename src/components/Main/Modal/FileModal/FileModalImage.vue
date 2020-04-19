<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.header" :style="styles.header">
      <file-modal-content-header :file-id="fileMeta.id" :is-white="true" />
    </div>
    <img draggable="false" :alt="fileMeta.name" :src="fileRawPath" />
    <div :class="$style.footer" :style="styles.footer">
      <file-modal-content-footer :file-id="fileMeta.id" :is-white="true" />
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
    })),
    header: makeStyles((theme, common) => ({
      background: `linear-gradient(to bottom, ${common.background.black}, transparent)`
    })),
    footer: makeStyles((theme, common) => ({
      background: `linear-gradient(to top, ${common.background.black}, transparent)`
    }))
  })

export default defineComponent({
  name: 'FileModalImage',
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
  height: 100vh;
  max-height: 100%;
  max-width: 60rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.header {
  position: absolute;
  top: 0;
  width: 100%;
  backdrop-filter: blur(4px);
  z-index: 1;
  opacity: 0;
  transition: all 0.2s ease;

  .container:hover & {
    opacity: 1;
  }
}
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  backdrop-filter: blur(4px);
  z-index: 1;
  opacity: 0;
  transition: all 0.2s ease;

  .container:hover & {
    opacity: 1;
  }
}
</style>
