<template>
  <modal-frame title="ファイル" :subtitle="file.name" icon-name="tag">
    {{ file }}
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import ModalFrame from '@/components/Main/Modal/Common/ModalFrame.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'FileModal',
  components: {
    ModalFrame
  },
  props: {
    fileId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const styles = useStyles()
    store.dispatch.entities.fetchFileMetaByFileId(props.fileId)
    const file = computed(() => store.state.entities.fileMetaData[props.fileId])
    return { styles, file }
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
