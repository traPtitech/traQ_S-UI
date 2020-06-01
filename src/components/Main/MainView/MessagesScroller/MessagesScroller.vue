<template>
  <div ref="rootRef" :class="$style.root" @scroll.passive="handleScroll">
    <div :class="$style.viewport">
      <messages-scroller-separator
        v-if="isReachedEnd"
        title="これ以上メッセージはありません"
        :class="$style.noMoreSeparator"
      />
      <div
        v-for="(messageId, index) in messageIds"
        :key="messageId"
        :class="$style.messageContainer"
      >
        <messages-scroller-separator
          v-if="!withoutSeparator && index === unreadIndex"
          title="ここから未読"
          :class="$style.unreadSeparator"
        />
        <messages-scroller-separator
          v-if="!withoutSeparator && dayDiff(index)"
          :title="createdDate(messageId)"
          :class="$style.dateSeparator"
        />
        <component
          :is="messageComponent"
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
  computed,
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
import ClipElement from '@/components/Main/MainView/MessageElement/ClipElement.vue'
import useMessageScrollerElementResizeObserver from './use/messageScrollerElementResizeObserver'
import { throttle } from 'lodash-es'
import { toggleSpoiler } from '@/lib/markdown'
import store from '@/store'
import MessagesScrollerSeparator from './MessagesScrollerSeparator.vue'
import { getFullDayString } from '@/lib/date'
import { embeddingOrigin } from '@/lib/apis'

const LOAD_MORE_THRESHOLD = 10

const useInternalLink = (
  rootRef: Ref<HTMLElement | null>,
  context: SetupContext
) => {
  const hostname = new URL(embeddingOrigin).hostname

  const onClick = (event: MouseEvent) => {
    if (!event.target) return
    const target = event.target as HTMLElement
    const $a = target.closest('a[href]') as HTMLAnchorElement | null
    if (!$a || !$a.href.includes(`://${hostname}`)) return

    // markdown内でない場合(添付ファイルなど)は無視
    const $body = $a.closest('.markdown-body')
    if (!$body) return

    const href = new URL($a.href)
    const linkPath = href.pathname + href.search + href.hash

    if (confirm(`${linkPath}への内部リンクを別タブで開きますか？`)) {
      return
    }

    event.preventDefault()
    context.root.$router.push(linkPath)
  }

  onMounted(() => {
    rootRef.value?.addEventListener('click', onClick)
  })
  onBeforeUnmount(() => {
    rootRef.value?.removeEventListener('click', onClick)
  })
}

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
    ClipElement,
    MessagesScrollerSeparator
  },
  props: {
    messageIds: {
      type: Array as PropType<MessageId[]>,
      required: true
    },
    isReachedEnd: { type: Boolean, required: true },
    isReachedLatest: { type: Boolean, required: true },
    entryMessageId: { type: String as PropType<MessageId> },
    isLoading: {
      type: Boolean,
      default: false
    },
    lastLoadingDirection: {
      type: String as PropType<LoadingDirection>,
      required: true
    },
    withoutSeparator: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context: SetupContext) {
    const rootRef = ref<HTMLElement>(null)
    const state = reactive({
      height: 0,
      scrollTop: 0
    })

    // DaySeparatorの表示
    const createdDate = (id: MessageId) => {
      const message = store.state.entities.messages[id]
      if (!message) {
        return ''
      }

      return getFullDayString(new Date(message.createdAt))
    }

    const unreadIndex = computed(() => {
      const unreadSince = store.state.domain.messagesView.unreadSince
      if (!unreadSince) return -1
      return props.messageIds.findIndex(
        id => store.state.entities.messages[id]?.createdAt === unreadSince
      )
    })

    const {
      onChangeHeight,
      onEntryMessageLoaded
    } = useMessageScrollerElementResizeObserver(rootRef, props, state)

    const messageComponent = computed(() =>
      store.state.ui.mainView.primaryView.type === 'clips'
        ? ClipElement
        : MessageElement
    )

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
            const scrollBottom =
              rootRef.value.scrollTop + rootRef.value.clientHeight

            // 一番下のメッセージあたりを見ているときに、
            // 新規に一つ追加された場合は一番下までスクロール
            if (state.height - 50 <= scrollBottom) {
              rootRef.value.scrollTo({
                top: newHeight
              })
            }
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

    useInternalLink(rootRef, context)
    useSpoilerToggler(rootRef)

    const dayDiff = useCompareDate(props)

    return {
      state,
      rootRef,
      handleScroll,
      onChangeHeight,
      unreadIndex,
      onEntryMessageLoaded,
      dayDiff,
      messageComponent,
      createdDate
    }
  }
})
</script>

<style lang="scss" module>
.root {
  height: 100%;
  overflow-y: scroll;
  padding: 12px 0;
  backface-visibility: hidden;
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
  contain: content;
}

.bottomSpacer {
  width: 100%;
  height: 12px;
}

.unreadSeparator {
  color: $theme-accent-notification;
}

.dateSeparator,
.noMoreSeparator {
  color: $theme-ui-secondary;
}
</style>
