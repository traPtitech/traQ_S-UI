<template>
  <div>
    <message-tools-content :message-id="messageId" @dots="openPopupMenu" />
    <portal v-if="isPopupMenuShown" :to="targetPortalName">
      <message-tools-menu
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
  ref
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import { buildFilePath } from '@/lib/api'
import Stamp from '@/components/UI/Stamp.vue'
import { StampId, MessageId } from '@/types/entity-ids'
import StampPickerStampListItem from '@/components/Main/StampPicker/StampPickerStampListItem.vue'
import MessageToolsContent, {
  targetPortalName
} from './MessageToolsContent.vue'
import MessageToolsMenu from './MessageToolsMenu.vue'

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
    const openPopupMenu = () => {
      isPopupMenuShown.value = true
    }
    const closePopupMenu = () => {
      isPopupMenuShown.value = false
    }
    return {
      addStamp,
      stamps,
      targetPortalName,
      isPopupMenuShown,
      openPopupMenu,
      closePopupMenu
    }
  }
})
</script>

<style lang="scss" module>
.toolsMenu {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 999;
}
</style>
