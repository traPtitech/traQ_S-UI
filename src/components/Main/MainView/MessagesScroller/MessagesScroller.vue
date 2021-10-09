<template>
  <div
    ref="rootRef"
    :class="$style.root"
    @scroll.passive="handleScroll"
    @click="onClick"
  >
    <div
      v-if="state.stampsInitialFetchCompleted"
      :class="$style.viewport"
      data-testid="channel-viewport"
    >
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
          :is-archived="isArchived"
          @change-height="onChangeHeight"
          @entry-message-loaded="onEntryMessageLoaded"
        />
      </div>
    </div>
    <div :class="$style.bottomSpacer"></div>
    <message-tools-menu-container />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  watch,
  reactive,
  computed,
  onMounted,
  PropType,
  Ref,
  nextTick,
  shallowRef
} from 'vue'
import { MessageId } from '/@/types/entity-ids'
import { LoadingDirection } from '/@/store/domain/messagesView/state'
import MessageElement from '/@/components/Main/MainView/MessageElement/MessageElement.vue'
import ClipElement from '/@/components/Main/MainView/MessageElement/ClipElement.vue'
import useMessageScrollerElementResizeObserver from './use/messageScrollerElementResizeObserver'
import { throttle } from 'throttle-debounce'
import { toggleSpoiler } from '/@/lib/markdown/spoiler'
import store from '/@/store'
import MessagesScrollerSeparator from './MessagesScrollerSeparator.vue'
import { getFullDayString } from '/@/lib/basic/date'
import { embeddingOrigin } from '/@/lib/apis'
import { useRoute, useRouter } from 'vue-router'
import { isMessageScrollerRoute, RouteName } from '/@/router'
import { stampsMapInitialFetchPromise } from '/@/store/entities/promises'
import MessageToolsMenuContainer from './MessageToolsMenuContainer.vue'
import { provideMessageContextMenuStore } from './providers/messageContextMenu'
import { useOpenLink } from '/@/use/openLink'

const LOAD_MORE_THRESHOLD = 10

type HTMLElementTargetMouseEvent = MouseEvent & { target: HTMLElement }

const useMarkdownInternalHandler = () => {
  const { hostname } = new URL(embeddingOrigin)
  const router = useRouter()
  const { shouldOpenWithRouter } = useOpenLink()

  const onClick = (event: MouseEvent) => {
    if (!event.target) return
    const e = event as HTMLElementTargetMouseEvent

    toggleSpoilerHandler(e)
    internalLinkClickHandler(e)
  }

  const toggleSpoilerHandler = (event: HTMLElementTargetMouseEvent) => {
    if (!event.target) return
    toggleSpoiler(event.target)
  }

  // チャンネルのリンク(a.message-channel-link)もこれで処理される
  const internalLinkClickHandler = (event: HTMLElementTargetMouseEvent) => {
    if (!event.target) return

    const $a = event.target.closest('a[href]') as HTMLAnchorElement | null
    if (!$a || !$a.href.includes(`://${hostname}`)) return

    // markdown内でない場合(添付ファイルなど)は無視
    const $body = $a.closest('.markdown-body')
    if (!$body) return

    // 同じタブで開かない場合は無視
    if (!shouldOpenWithRouter(event)) return
    event.preventDefault()

    const linkPath = $a.pathname + $a.search + $a.hash

    const resolved = router.resolve(linkPath)
    // NotFoundだけが引っかかった場合、または何も引っかからなかった場合はフロントで処理するルートではない
    const isNotHandledWithRouter =
      resolved.matched.filter(m => m.name !== RouteName.NotFound).length === 0
    if (isNotHandledWithRouter) return

    router.push(linkPath)
  }

  return { onClick }
}

const useCompareDate = (props: { messageIds: MessageId[] }) => {
  const dayDiff = (index: number) => {
    if (index <= 0) {
      return true
    }
    const { messagesMap } = store.state.entities.messages
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pre = messagesMap.get(props.messageIds[index - 1]!)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const current = messagesMap.get(props.messageIds[index]!)
    const preDate = new Date(pre?.createdAt ?? '')
    const currentDate = new Date(current?.createdAt ?? '')
    return preDate.toDateString() !== currentDate.toDateString()
  }
  return dayDiff
}

/** 設定などから戻ってきた際のスクロール位置リストア */
const useScrollRestoration = (
  rootRef: Ref<HTMLElement | null>,
  state: { scrollTop: number }
) => {
  const route = useRoute()
  watch(
    computed(() => route.name),
    async (to, from) => {
      if (isMessageScrollerRoute(from)) {
        store.commit.ui.mainView.setLastScrollPosition(
          rootRef.value?.scrollTop ?? 0
        )
      }
      if (isMessageScrollerRoute(to)) {
        state.scrollTop = store.state.ui.mainView.lastScrollPosition
        await nextTick()
        rootRef.value?.scrollTo({ top: state.scrollTop })
        store.commit.ui.mainView.setLastScrollPosition(0)
      }
    }
  )
}

export default defineComponent({
  name: 'MessagesScroller',
  components: {
    MessagesScrollerSeparator,
    MessageToolsMenuContainer
  },
  props: {
    messageIds: {
      type: Array as PropType<MessageId[]>,
      required: true
    },
    isReachedEnd: { type: Boolean, required: true },
    isReachedLatest: { type: Boolean, required: true },
    entryMessageId: { type: String as PropType<MessageId>, default: undefined },
    isArchived: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    lastLoadingDirection: {
      type: String as PropType<LoadingDirection>,
      required: true
    },
    unreadSince: {
      type: String,
      default: undefined
    },
    withoutSeparator: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    requestLoadFormer: () => true,
    requestLoadLatter: () => true
  },
  setup(props, { emit }) {
    provideMessageContextMenuStore()

    const rootRef = shallowRef<HTMLElement | null>(null)
    const state = reactive({
      height: 0,
      scrollTop: store.state.ui.mainView.lastScrollPosition,
      stampsInitialFetchCompleted: false
    })

    // メッセージスタンプ表示時にスタンプが存在していないと
    // 場所が確保されないくてずれてしまうので、取得完了を待つ
    ;(async () => {
      await stampsMapInitialFetchPromise
      state.stampsInitialFetchCompleted = true
    })()

    // DaySeparatorの表示
    const createdDate = (id: MessageId) => {
      const message = store.state.entities.messages.messagesMap.get(id)
      if (!message) {
        return ''
      }

      return getFullDayString(new Date(message.createdAt))
    }

    const unreadIndex = computed(() => {
      if (!props.unreadSince) return -1
      return props.messageIds.findIndex(
        id =>
          store.state.entities.messages.messagesMap.get(id)?.createdAt ===
          props.unreadSince
      )
    })

    const { onChangeHeight, onEntryMessageLoaded } =
      useMessageScrollerElementResizeObserver(rootRef, props, state)

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
      (ids, prevIds) => {
        if (!rootRef.value) return
        /* state.height の更新を忘れないようにすること */

        const newHeight = rootRef.value.scrollHeight
        if (
          props.lastLoadingDirection === 'latest' ||
          props.lastLoadingDirection === 'former'
        ) {
          if (ids.length - prevIds.length === -1) {
            // 削除された場合は何もしない
            state.height = newHeight
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
            state.height = newHeight
            return
          }
          rootRef.value.scrollTo({
            top: newHeight - state.height
          })
        }
        state.height = newHeight
      },
      { deep: true, flush: 'post' }
    )

    const handleScroll = throttle(17, () => {
      if (!rootRef.value) return
      const { clientHeight, scrollHeight, scrollTop } = rootRef.value
      state.scrollTop = scrollTop

      if (props.isLoading) return
      if (state.scrollTop < LOAD_MORE_THRESHOLD && !props.isReachedEnd) {
        emit('requestLoadFormer')
      }
      if (
        scrollHeight - state.scrollTop - clientHeight < LOAD_MORE_THRESHOLD &&
        !props.isReachedLatest
      ) {
        emit('requestLoadLatter')
      }
    })

    const { onClick } = useMarkdownInternalHandler()
    useScrollRestoration(rootRef, state)

    const dayDiff = useCompareDate(props)

    return {
      state,
      onClick,
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
  contain: strict;
  // overflow-anchorはデフォルトでautoだが、Safariが対応していないので、
  // 手動で調節しているため明示的に無効化する
  overflow-anchor: none;
  // iOSで無限にロードが走るのを防止する
  -webkit-overflow-scrolling: auto;
}

.messageContainer {
  display: contents;
}

.viewport {
  display: flex;
  flex-flow: column;
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
