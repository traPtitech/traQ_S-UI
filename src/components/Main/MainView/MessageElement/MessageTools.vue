<template>
  <message-tools-content :message-id="messageId" @open="onOpen" />
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType,
  Ref
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import Stamp from '@/components/UI/Stamp.vue'
import { StampId, MessageId } from '@/types/entity-ids'
import StampPickerStampListItem from '@/components/Main/StampPicker/StampPickerStampListItem.vue'
import MessageToolsContent from './MessageToolsContent.vue'
import useStampPickerInvoker from '@/use/stampPickerInvoker'
import { targetPortalName } from '@/views/Main.vue'

const useStyles = (position: Ref<{ x: number; y: number }>) =>
  reactive({
    toolsMenu: makeStyles(theme => ({
      top: `${position.value.y}px`,
      left: `${position.value.x}px`
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
    const position = computed(() => store.state.ui.messageContextMenu.position)
    const styles = useStyles(position)
    const addStamp = (stampId: StampId) => {
      store.dispatch.domain.messagesView.addStamp({
        messageId: props.messageId,
        stampId
      })
    }
    const stamps = computed(() => store.getters.domain.me.recentStampIds)
    const onOpen = (type: 'dot' | 'stampPicker', e: MouseEvent) => {
      const { invokeStampPicker } = useStampPickerInvoker(
        targetPortalName,
        stampData => {
          store.dispatch.domain.messagesView.addStamp({
            messageId: props.messageId,
            stampId: stampData.id
          })
        },
        { x: e.pageX, y: e.pageY }
      )
      if (type === 'dot') {
        store.dispatch.ui.messageContextMenu.openMessageContextMenu({
          messageId: props.messageId,
          x: e.pageX,
          y: e.pageY
        })
      } else {
        if (store.getters.ui.stampPicker.isStampPickerShown) {
          store.dispatch.ui.stampPicker.closeStampPicker()
        } else {
          invokeStampPicker()
        }
      }
    }
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
