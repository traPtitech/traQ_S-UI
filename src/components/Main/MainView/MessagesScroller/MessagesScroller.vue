<template>
  <div ref="rootRef" :class="$style.root" @scroll.passive="handleScroll">
    <div ref="viewportRef" :class="$style.viewport">
      <message-element
        :class="$style.element"
        v-for="messageId in messageIds"
        :key="messageId"
        :message-id="messageId"
        :is-entry-message="entryMessageId === messageId"
        @change-height="onChangeHeight"
        @entry-message-loaded="onEntryMessageLoaded"
      />
    </div>
    <div :class="$style.bottomSpacer"></div>
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
  PropType,
  Ref,
  onBeforeUnmount
} from '@vue/composition-api'
import { MessageId } from '@/types/entity-ids'
import store from '@/store'
import { LoadingDirection } from '@/store/domain/messagesView/state'
import MessageElement from '@/components/Main/MainView/MessageElement/MessageElement.vue'
import useMessageScrollerElementResizeObserver from './use/messageScrollerElementResizeObserver'
import { throttle } from 'lodash-es'
import { toggleSpoiler } from '@/lib/markdown'

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

export default defineComponent({
  name: 'MessagesScroller',
  components: {
    MessageElement
  },
  props: {
    messageIds: {
      type: Array as PropType<MessageId[]>,
      required: true
    },
    entryMessageId: String as PropType<MessageId>,
    isLoading: {
      type: Boolean,
      default: false
    },
    lastLoadingDirection: {
      type: String as PropType<LoadingDirection>,
      required: true
    },
    isInitialLoad: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context: SetupContext) {
    const rootRef = ref<HTMLElement>(null)
    const state = reactive({
      height: 0,
      scrollTop: 0,
      isFirstView: computed(
        () =>
          store.state.domain.messagesView.loadedMessageOldestDate === undefined
      )
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
          // 新規に一つ追加された場合は一番下までスクロール
          rootRef.value.scrollTo({
            top:
              state.isFirstView || ids.length - prevIds.length === 1
                ? newHeight
                : newHeight - state.height
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

      if (state.isFirstView || props.isLoading) return
      if (
        state.scrollTop < LOAD_MORE_THRESHOLD &&
        !store.state.domain.messagesView.isReachedEnd
      ) {
        context.emit('request-load-former')
      }
      if (
        scrollHeight - state.scrollTop - clientHeight < LOAD_MORE_THRESHOLD &&
        !store.state.domain.messagesView.isReachedLatest
      ) {
        context.emit('request-load-latter')
      }
    }, 17)

    useSpoilerToggler(rootRef)

    return {
      state,
      rootRef,
      handleScroll,
      onChangeHeight,
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

.bottomSpacer {
  width: 100%;
  height: 12px;
}
</style>
