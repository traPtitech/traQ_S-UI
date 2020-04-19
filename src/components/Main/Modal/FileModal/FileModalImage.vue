<template>
  <div :class="$style.container" :style="styles.container">
    <img draggable="false" :alt="fileMeta.name" :src="fileRawPath" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'

import { makeStyles } from '@/lib/styles'
import useFileMeta from '../../../../use/fileMeta'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'FileModalImage',
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
}
</style>
