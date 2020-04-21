<template>
  <div :class="$style.container" :style="styles.container">
    <file-modal-content-header :file-id="props.fileId" :class="$style.header" />
    <file-modal-content-footer :file-id="props.fileId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import FileModalContentHeader from '@/components/Main/Modal/FileModal/FileModalContentHeader.vue'
import FileModalContentFooter from '@/components/Main/Modal/FileModal/FileModalContentFooter.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      backgroundColor: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'FileModalFile',
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
  setup(props) {
    const styles = useStyles()
    return { styles, props }
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
.header {
  margin-bottom: 12px;
}
</style>
