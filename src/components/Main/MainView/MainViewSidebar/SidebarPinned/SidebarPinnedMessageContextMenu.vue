<template>
  <context-menu-container :position="position" @close="close">
    <div :class="$style.container">
      <span
        v-if="!isMinimum"
        :class="$style.text"
        @click="withClose(removePinned)"
      >
        ピン留めを外す
      </span>
      <span :class="$style.text" @click="withClose(copyLink)">
        リンクをコピー
      </span>
    </div>
  </context-menu-container>
</template>

<script lang="ts">
import { defineComponent, PropType, toRef } from 'vue'
import ContextMenuContainer from '/@/components/UI/ContextMenuContainer.vue'
import { MessageId } from '/@/types/entity-ids'
import { Point } from '/@/lib/basic/point'
import useCopyLink from '/@/composables/contextMenu/useCopyLink'
import usePinToggler from '/@/composables/contextMenu/usePinToggler'

export default defineComponent({
  name: 'SidebarPinnedMessageContextMenu',
  components: {
    ContextMenuContainer
  },
  props: {
    position: {
      type: Object as PropType<Point>,
      required: true
    },
    messageId: {
      type: String as PropType<MessageId>,
      required: true
    },
    isMinimum: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    close: () => true
  },
  setup(props, { emit }) {
    const messageId = toRef(props, 'messageId')

    const { copyLink } = useCopyLink(messageId)
    const { removePinned } = usePinToggler(messageId)

    const close = () => {
      emit('close')
    }
    const withClose = async (func: () => void | Promise<void>) => {
      await func()
      close()
    }

    return {
      removePinned,
      copyLink,
      close,
      withClose
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  @include color-ui-secondary;
  @include drop-shadow-default;
  display: grid;
  width: max-content;
  padding: 8px 16px;
  border-radius: 4px;
  contain: content;
}

.text {
  margin: 2px 0;
  cursor: pointer;
}
</style>
