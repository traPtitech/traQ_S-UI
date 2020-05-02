<template>
  <div>
    <message-element
      v-if="viewInfo.type === 'channel' || 'dm'"
      :class="$style.element"
      :message-id="messageId"
      :is-entry-message="isEntryMessage"
      @change-height="onChangeHeight"
      @entry-message-loaded="onEntryMessageLoaded"
    />
    <clip-element
      v-else-if="viewInfo.type === 'clips'"
      :class="$style.element"
      :message-id="messageId"
      :is-entry-message="isEntryMessage"
      @change-height="onChangeHeight"
      @entry-message-loaded="onEntryMessageLoaded"
    />
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
  ref,
  SetupContext
} from '@vue/composition-api'
import MessageElement from '@/components/Main/MainView/MessageElement/MessageElement.vue'
import ClipElement from '@/components/Main/MainView/MessageElement/ClipElement.vue'
import useMessageScrollerElementResizeObserver from '@/components/Main/MainView/MessagesScroller/use/messageScrollerElementResizeObserver'
import { LoadingDirection } from '@/store/domain/messagesView/state'
import { MessageId } from '@/types/entity-ids'
import { ViewInformation } from '@/store/ui/mainView/state'

export default defineComponent({
  name: 'MessageSelector',
  components: {
    MessageElement,
    ClipElement
  },
  props: {
    viewInfo: Object as PropType<ViewInformation>,
    messageId: {
      type: String as PropType<MessageId>,
      required: true
    },
    isReachedEnd: { type: Boolean, required: true },
    isReachedLatest: { type: Boolean, required: true },
    isEntryMessage: { type: Boolean, required: true },
    isLoading: {
      type: Boolean,
      default: false
    },
    lastLoadingDirection: {
      type: String as PropType<LoadingDirection>,
      required: true
    }
  },
  setup(props) {
    const rootRef = ref<HTMLElement>(null)
    const state = reactive({
      height: 0,
      scrollTop: 0
    })

    const {
      onChangeHeight,
      onEntryMessageLoaded
    } = useMessageScrollerElementResizeObserver(rootRef, props, state)

    return {
      onChangeHeight,
      onEntryMessageLoaded
    }
  }
})
</script>

<style lang="scss" module>
.element {
  margin: 4px 0;
}
</style>
