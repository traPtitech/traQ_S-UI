<template>
  <message-tools-content :message-id="messageId" @open="onOpen" />
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType,
  ref,
  watch
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import { buildFilePath } from '@/lib/api'
import Stamp from '@/components/UI/Stamp.vue'
import { StampId, MessageId } from '@/types/entity-ids'
import StampPickerStampListItem from '@/components/Main/StampPicker/StampPickerStampListItem.vue'
import MessageToolsContent from './MessageToolsContent.vue'
import useStampPickerInvoker from '@/use/stampPickerInvoker'
import { targetPortalName } from '@/views/Main.vue'

const useStyles = () =>
  reactive({
    toolsMenu: makeStyles(theme => ({
      top: `${store.state.ui.messageContextMenu.position.y}px`,
      left: `${store.state.ui.messageContextMenu.position.x}px`
    }))
  })

export default defineComponent({
  name: 'MessageTools',
  components: {
    Icon,
    Stamp,
    StampPickerStampListItem,
    MessageToolsContent
  },
  props: { messageId: { type: String as PropType<MessageId>, required: true } },
  setup(props) {
    const styles = useStyles()
    const addStamp = (stampId: StampId) => {
      store.dispatch.domain.messagesView.addStamp({
        messageId: props.messageId,
        stampId
      })
      store.commit.domain.me.pushLocalStampHistory({
        stampId: stampId,
        datetime: new Date()
      })
    }
    const stamps = computed(() => store.getters.domain.me.recentStampIds)
    const { invokeStampPicker } = useStampPickerInvoker(
      targetPortalName,
      stampData => {
        store.dispatch.domain.messagesView.addStamp({
          messageId: props.messageId,
          stampId: stampData.id
        })
      }
    )
    const onOpen = (type: 'dot' | 'stampPicker', e: MouseEvent) => {
      if (type === 'dot') {
        store.dispatch.ui.messageContextMenu.openMessageContextMenu({
          messageId: props.messageId,
          x: e.pageX,
          y: e.pageY
        })
      } else {
        if (store.getters.ui.stampPicker.isStampPickerShown) {
          store.dispatch.ui.stampPicker.closeStampPicker()
          store.commit.ui.stampPicker.initPosition()
        } else {
          store.commit.ui.stampPicker.setPosition({
            x: e.pageX,
            y: e.pageY
          })
          invokeStampPicker()
        }
      }
    }
    // watch(
    //   () => props.messageId,
    //   (newV, oldV) => {
    //     store.dispatch.ui.stampPicker.closeStampPicker()
    //     store.dispatch.ui.messageContextMenu.closeMessageContextMenu()
    //   }
    // )
    return {
      addStamp,
      stamps,
      targetPortalName,
      onOpen,
      styles
    }
  }
})
</script>

<style lang="scss" module>
.toolsMenu {
  position: absolute;
  z-index: 999;
  transform: translateX(-100%);
}
</style>
