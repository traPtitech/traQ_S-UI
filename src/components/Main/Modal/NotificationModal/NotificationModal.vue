<template>
  <modal-frame
    title="通知設定"
    :subtitle="`#${currentChannelPathString}`"
    icon-mdi
    icon-name="bell"
  >
    <modal-section title="自分の通知設定">
      <notification-state-selector />
    </modal-section>
    <modal-section
      title="他ユーザーの通知設定"
      description="ユーザーに通知を送るか選択できます（通知を送る場合、未読管理も有効になります）"
    ></modal-section>
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import useCurrentChannelPath from '@/use/currentChannelPath'
import ModalFrame from '../Common/ModalFrame.vue'
import ModalSection from '../Common/ModalSection.vue'
import NotificationStateSelector from './NotificationStateSelector.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'NotificationModal',
  components: {
    ModalFrame,
    ModalSection,
    NotificationStateSelector
  },
  setup() {
    const styles = useStyles()
    const { currentChannelPathString } = useCurrentChannelPath()
    return { styles, currentChannelPathString }
  }
})
</script>

<style lang="scss" module></style>
