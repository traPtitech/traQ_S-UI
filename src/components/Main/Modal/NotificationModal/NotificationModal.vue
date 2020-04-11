<template>
  <modal-frame
    title="通知設定"
    :subtitle="`#${currentChannelPathString}`"
    icon-mdi
    icon-name="bell"
    >通知</modal-frame
  >
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import useCurrentChannelPath from '@/use/currentChannelPath'
import ModalFrame from '../Common/ModalFrame.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'NotificationModal',
  components: {
    ModalFrame
  },
  setup() {
    const styles = useStyles()
    const { currentChannelPathString } = useCurrentChannelPath()
    return { styles, currentChannelPathString }
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
