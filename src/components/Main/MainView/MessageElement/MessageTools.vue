<template>
  <div>
    <message-tools-content :message-id="messageId" @open="onOpen" />
    <portal v-if="isPopupMenuShown" :to="targetPortalName">
      <message-tools-menu
        :style="styles.toolsMenu"
        :class="$style.toolsMenu"
        :message-id="messageId"
        v-click-outside="closePopupMenu"
      />
    </portal>
  </div>
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
import MessageToolsMenu from './MessageToolsMenu.vue'
import useStampPickerInvoker from '@/use/stampPickerInvoker'
import { targetPortalName } from '../MainView.vue'

const useStyles = (position: { x: number; y: number }) =>
  reactive({
    toolsMenu: makeStyles(theme => ({
      top: `${position.y}px`,
      left: `${position.x}px`
    }))
  })

export default defineComponent({
  name: 'MessageTools',
  components: {
    Icon,
    Stamp,
    StampPickerStampListItem,
    MessageToolsContent,
    MessageToolsMenu
  },
  props: { messageId: { type: String as PropType<MessageId>, required: true } },
  setup(props) {
    const positionState = reactive({
      x: 0,
      y: 0
    })
    const styles = useStyles(positionState)
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
    const isPopupMenuShown = ref(false)
    const closePopupMenu = () => {
      isPopupMenuShown.value = false
    }
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
      positionState.x = e.screenX
      positionState.y = e.screenY
      if (type === 'dot') {
        isPopupMenuShown.value = true
      } else {
        if (store.getters.ui.stampPicker.isStampPickerShown) {
          store.dispatch.ui.stampPicker.closeStampPicker()
        } else {
          invokeStampPicker()
        }
      }
    }
    watch(
      () => props.messageId,
      (newV, oldV) => {
        if (store.getters.ui.stampPicker.isStampPickerShown) {
          store.dispatch.ui.stampPicker.closeStampPicker()
        }
      }
    )
    return {
      addStamp,
      stamps,
      targetPortalName,
      isPopupMenuShown,
      closePopupMenu,
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
}

.menuRef {
  position: relative;
}
</style>
