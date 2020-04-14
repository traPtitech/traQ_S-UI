<template>
  <div ref="rootRef" :class="$style.root" @scroll.passive="handleScroll">
    <div ref="viewportRef" :class="$style.viewport">
      <message-element
        :class="$style.element"
        v-for="messageId in messageIds"
        :key="messageId"
        :message-id="messageId"
        :is-entry-message="state.entryMessageId === messageId"
        @observer-register="onObserverRegister"
        @change-height="onChangeHeight"
        @entry-message-loaded="onEntryMessageLoaded"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  watch,
  reactive,
  computed,
  SetupContext,
  ref,
  onMounted,
  PropType
} from '@vue/composition-api'
import { MessageId } from '@/types/entity-ids'
import store from '@/store'
import MessageElement from './MessageElement/MessageElement.vue'
import useMessageScrollerElementResizeObserver from './use/messageScrollerElementResizeObserver'
import { throttle } from 'lodash-es'

const LOAD_MORE_THRESHOLD = 10

export default defineComponent({
  name: 'MessagesScroller',
  components: {
    MessageElement
  },
  props: {
    messageIds: {
      type: Array as PropType<MessageId[]>,
      required: true
    }
  },
  setup(props, context: SetupContext) {
    const state = reactive({
      height: 0,
      scrollTop: 0,
      loadingDirection: undefined as 'former' | 'latter' | undefined,
      isFirstView: computed(
        () =>
          store.state.domain.messagesView.loadedMessageOldestDate === undefined
      ),
      entryMessageId: computed(
        () => store.state.domain.messagesView.entryMessageId
      ),
      isLoading: computed((): boolean => !!state.loadingDirection)
    })
    const rootRef = ref<HTMLElement>(null)

    onMounted(() => {
      state.height = rootRef.value?.scrollHeight ?? 0
    })

    watch(
      () => props.messageIds,
      async (ids, prevIds) => {
        if (!rootRef.value) return
        await context.root.$nextTick()
        const newHeight = rootRef.value.scrollHeight
        if (state.loadingDirection !== 'latter') {
          rootRef.value.scrollTo({
            top:
              // 新規に一つ追加された場合は一番下までスクロール
              // TODO: 次のようにする
              // - 中途半端な位置にスクロールしてるときに1件追加 → 見た目上スクロールしない
              // - 一番下までスクロールしてる時に1件追加 → 一番下までスクロール
              state.isFirstView || ids.length - prevIds.length === 1
                ? newHeight
                : newHeight - state.height
          })
        }
        state.height = newHeight
        state.loadingDirection = undefined
      }
    )

    const {
      onChangeHeight,
      onObserverRegister,
      onEntryMessageLoaded
    } = useMessageScrollerElementResizeObserver(rootRef, state)

    const handleScroll = throttle(async () => {
      if (!rootRef.value) return
      const clientHeight = rootRef.value.clientHeight
      const scrollHeight = rootRef.value.scrollHeight
      const scrollTop = rootRef.value.scrollTop
      state.scrollTop = scrollTop

      if (state.isFirstView || state.isLoading) return
      if (
        state.scrollTop < LOAD_MORE_THRESHOLD &&
        !store.state.domain.messagesView.isReachedEnd
      ) {
        state.loadingDirection = 'former'
        await store.dispatch.domain.messagesView.fetchAndRenderChannelFormerMessages()
      }
      if (
        scrollHeight - state.scrollTop - clientHeight < LOAD_MORE_THRESHOLD &&
        !store.state.domain.messagesView.isReachedLatest
      ) {
        state.loadingDirection = 'latter'
        await store.dispatch.domain.messagesView.fetchAndRenderChannelLatterMessages()
      }
    }, 17)

    return {
      state,
      rootRef,
      handleScroll,
      onChangeHeight,
      onObserverRegister,
      onEntryMessageLoaded
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

.viewport {
  display: flex;
  flex-flow: column;
  justify-content: flex-end;
  min-height: 100%;
}

.element {
  margin: 4px 0;
}
</style>
