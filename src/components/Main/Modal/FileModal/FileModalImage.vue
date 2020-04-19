<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.overlay">
      <file-modal-item-content-header :file-id="fileMeta.id" :is-white="true" />
    </div>
    <img draggable="false" :alt="fileMeta.name" :src="fileRawPath" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'

import { makeStyles } from '@/lib/styles'
import useFileMeta from '@/use/fileMeta'
import FileModalItemContentHeader from '@/components/Main/Modal/FileModal/FileModalItemContentHeader.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'FileModalImage',
  components: {
    FileModalItemContentHeader
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
  background-color: #222222;
  width: 100vw;
  height: 100vh;
  max-height: 100%;
  max-width: 60rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.overlay {
  position: absolute;
  top: 0;
  width: 100%;
  background: linear-gradient(to bottom, #222222, transparent);
  backdrop-filter: blur(4px);
  cursor: pointer;
  z-index: 1;
  opacity: 0;
  transition: all 0.2s ease;

  .container:hover & {
    opacity: 1;
  }
}
</style>
