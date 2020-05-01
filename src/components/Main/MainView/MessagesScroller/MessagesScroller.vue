<template>
  <div ref="rootRef" :class="$style.root" @scroll.passive="handleScroll">
    <div ref="viewportRef" :class="$style.viewport">
      <div
        v-for="(messageId, index) in messageIds"
        :key="messageId"
        :class="$style.messageContainer"
      >
        <messages-scroller-day-separator
          v-if="dayDiff(index)"
          :message-id="messageId"
        />
        <message-element
          :class="$style.element"
          :message-id="messageId"
          :is-entry-message="entryMessageId === messageId"
          @change-height="onChangeHeight"
          @entry-message-loaded="onEntryMessageLoaded"
        />
      </div>
    </div>
    <div :class="$style.bottomSpacer"></div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  watch,
  reactive,
  SetupContext,
  ref,
  onMounted,
  PropType,
  Ref,
  onBeforeUnmount
} from '@vue/composition-api'
import { MessageId } from '@/types/entity-ids'
import { LoadingDirection } from '@/store/domain/messagesView/state'
import MessageElement from '@/components/Main/MainView/MessageElement/MessageElement.vue'
import useMessageScrollerElementResizeObserver from './use/messageScrollerElementResizeObserver'
import { throttle } from 'lodash-es'
import { toggleSpoiler } from '@/lib/markdown'
import store from '@/store'
import MessagesScrollerDaySeparator from './MessagesScrollerDaySeparator.vue'

const LOAD_MORE_THRESHOLD = 10

const useSpoilerToggler = (rootRef: Ref<HTMLElement | null>) => {
  const toggleSpoilerHandler = (event: MouseEvent) => {
    if (event.target) {
      toggleSpoiler(event.target as HTMLElement)
    }
  }

  onMounted(() => {
    rootRef.value?.addEventListener('click', toggleSpoilerHandler)
  })

  onBeforeUnmount(() => {
    rootRef.value?.removeEventListener('click', toggleSpoilerHandler)
  })
}

const useCompareDate = (props: { messageIds: MessageId[] }) => {
  const dayDiff = (index: number) => {
    if (index === 0) {
      return true
    }
    const pre = store.state.entities.messages[props.messageIds[index - 1]]
    const current = store.state.entities.messages[props.messageIds[index]]
    const preDate = new Date(pre?.createdAt || ``)
    const currentDate = new Date(current?.createdAt || ``)
    return preDate.toDateString() !== currentDate.toDateString()
  }
  return dayDiff
}

export default defineComponent({
  name: 'MessagesScroller',
  components: {
    MessageElement,
    MessagesScrollerDaySeparator
  },
  props: {
    messageIds: {
      type: Array as PropType<MessageId[]>,
      required: true
    },
    isReachedEnd: { type: Boolean, required: true },
    isReachedLatest: { type: Boolean, required: true },
    entryMessageId: String as PropType<MessageId>,
    isLoading: {
      type: Boolean,
      default: false
    },
    lastLoadingDirection: {
      type: String as PropType<LoadingDirection>,
      required: true
    }
  },
  setup(props, context: SetupContext) {
    const rootRef = ref<HTMLElement>(null)
    const state = reactive({
      height: 0,
      scrollTop: 0
    })

    const {
      onChangeHeight,
      onEntryMessageLoaded
    } = useMessageScrollerElementResizeObserver(rootRef, props, state)

    onMounted(() => {
      state.height = rootRef.value?.scrollHeight ?? 0
    })

    watch(
      () => props.messageIds,
      async (ids, prevIds) => {
        if (!rootRef.value) return
        await context.root.$nextTick()
        const newHeight = rootRef.value.scrollHeight
        if (
          props.lastLoadingDirection === 'latest' ||
          props.lastLoadingDirection === 'former'
        ) {
          if (ids.length - prevIds.length === -1) {
            // 削除された場合は何もしない
            return
          }
          // XXX: 追加時にここは0になる
          if (ids.length - prevIds.length === 0) {
            // 新規に一つ追加された場合は一番下までスクロール
            rootRef.value.scrollTo({
              top: newHeight
            })
            return
          }
          rootRef.value.scrollTo({
            top: newHeight - state.height
          })
        }
        state.height = newHeight
      }
    )

    const handleScroll = throttle(() => {
      if (!rootRef.value) return
      const clientHeight = rootRef.value.clientHeight
      const scrollHeight = rootRef.value.scrollHeight
      const scrollTop = rootRef.value.scrollTop
      state.scrollTop = scrollTop

      if (props.isLoading) return
      if (state.scrollTop < LOAD_MORE_THRESHOLD && !props.isReachedEnd) {
        context.emit('request-load-former')
      }
      if (
        scrollHeight - state.scrollTop - clientHeight < LOAD_MORE_THRESHOLD &&
        !props.isReachedLatest
      ) {
        context.emit('request-load-latter')
      }
    }, 17)

    useSpoilerToggler(rootRef)

    const dayDiff = useCompareDate(props)

    return {
      state,
      rootRef,
      handleScroll,
      onChangeHeight,
      onEntryMessageLoaded,
      dayDiff
    }
  }
})
</script>

<style lang="scss" module>
.root {
  height: 100%;
  overflow-y: scroll;
  overflow-anchor: none;
  padding: 12px 0;
}

.messageContainer {
  display: contents;
}

.viewport {
  display: flex;
  flex-flow: column;
  justify-content: flex-end;
  min-height: 100%;
}

.element {
  margin: 4px 0;
}

.bottomSpacer {
  width: 100%;
  height: 12px;
}
</style>
