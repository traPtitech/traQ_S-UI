<template>
  <div
    ref="rootRef"
    :class="$style.root"
    @scroll.passive="
      () => {
        handleScroll()
        emit('scrollPassive')
      }
    "
    @click="onClick"
  >
    <div
      v-if="stampsMapFetched"
      :class="$style.viewport"
      data-testid="channel-viewport"
    >
      <messages-scroller-separator
        v-if="isReachedEnd"
        title="これ以上メッセージはありません"
        :class="$style.noMoreSeparator"
      />
      <template v-for="messageId in messageIds" :key="messageId">
        <slot
          :message-id="messageId"
          :on-change-height="onChangeHeight"
          :on-entry-message-loaded="onEntryMessageLoaded"
        />
      </template>
    </div>
    <div :class="$style.bottomSpacer"></div>
  </div>
</template>

<script lang="ts">
import type { Ref } from 'vue'
import {
  watch,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  shallowRef
} from 'vue'
import type { MessageId } from '/@/types/entity-ids'
import type { LoadingDirection } from './composables/useMessagesFetcher'
import useMessageScrollerElementResizeObserver from './composables/useMessageScrollerElementResizeObserver'
import { throttle } from 'throttle-debounce'
import { toggleSpoiler } from '/@/lib/markdown/spoiler'
import { embeddingOrigin } from '/@/lib/apis'
import { useRoute, useRouter } from 'vue-router'
import { isMessageScrollerRoute, RouteName } from '/@/router'
import { useOpenLink } from '/@/composables/useOpenLink'
import { useMainViewStore } from '/@/store/ui/mainView'
import { useStampsStore } from '/@/store/entities/stamps'

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

    const $a = event.target.closest<HTMLAnchorElement>('a[href]')
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

/** 設定などから戻ってきた際のスクロール位置リストア */
const useScrollRestoration = (
  rootRef: Ref<HTMLElement | null>,
  state: { scrollTop: number }
) => {
  const { lastScrollPosition } = useMainViewStore()
  const route = useRoute()
  watch(
    computed(() => route.name),
    async (to, from) => {
      if (isMessageScrollerRoute(from)) {
        lastScrollPosition.value = rootRef.value?.scrollTop ?? 0
      }
      if (isMessageScrollerRoute(to)) {
        state.scrollTop = lastScrollPosition.value
        await nextTick()
        rootRef.value?.scrollTo({ top: state.scrollTop })
        lastScrollPosition.value = 0
      }
    }
  )
}
</script>

<script lang="ts" setup>
import MessagesScrollerSeparator from './MessagesScrollerSeparator.vue'

const props = withDefaults(
  defineProps<{
    messageIds: MessageId[]
    isReachedEnd: boolean
    isReachedLatest: boolean
    isLoading?: boolean
    entryMessageId?: MessageId
    lastLoadingDirection: LoadingDirection
  }>(),
  {
    isLoading: false
  }
)

const emit = defineEmits<{
  (e: 'requestLoadFormer'): void
  (e: 'requestLoadLatter'): void
  (e: 'windowViewd'): void
  (e: 'scrollPassive'): void
}>()

const { lastScrollPosition } = useMainViewStore()

// メッセージスタンプ表示時にスタンプが存在していないと
// 場所が確保されないくてずれてしまうので、取得完了を待つ
const { stampsMapFetched } = useStampsStore()

const rootRef = shallowRef<HTMLElement | null>(null)
const state = reactive({
  height: 0,
  scrollTop: lastScrollPosition.value
})

const { onChangeHeight, onEntryMessageLoaded } =
  useMessageScrollerElementResizeObserver(rootRef, props, state)

onMounted(() => {
  // 表示されている
  if (stampsMapFetched.value) {
    state.height = rootRef.value?.scrollHeight ?? 0
  }
})
// マウント後にstampの取得が完了した場合
watch(stampsMapFetched, async fetched => {
  if (fetched && rootRef.value) {
    await nextTick()
    const scrollHeight = rootRef.value.scrollHeight
    rootRef.value.scrollTop = scrollHeight
    state.height = scrollHeight
    state.scrollTop = scrollHeight
  }
})

watch(
  () => props.messageIds,
  (ids, prevIds) => {
    if (!rootRef.value) return
    /* state.height の更新を忘れないようにすること */
    const newHeight = rootRef.value.scrollHeight
    if (ids.length - prevIds.length === -1) {
      // 削除された場合は何もしない
      state.height = newHeight
      return
    }
    if (
      props.lastLoadingDirection === 'latest' ||
      props.lastLoadingDirection === 'former' ||
      props.isReachedLatest
    ) {
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
      //上に追加された時はスクロール位置を変更する。
      if (props.lastLoadingDirection === 'former') {
        rootRef.value.scrollTo({
          top: newHeight - state.height
        })
      }
    } else state.height = newHeight
  },
  { deep: true, flush: 'post' }
)

const requestLoadMessages = () => {
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
}

const handleScroll = throttle(17, requestLoadMessages)

const visibilitychangeListener = () => {
  emit('windowViewd')
  if (document.visibilityState === 'visible') {
    nextTick(requestLoadMessages)
  }
}
const focusListener = () => {
  emit('windowViewd')
  nextTick(requestLoadMessages)
}
const blurListener = () => {
  emit('windowViewd')
}
onMounted(() => {
  document.addEventListener('visibilitychange', visibilitychangeListener)
  window.addEventListener('focus', focusListener)
  window.addEventListener('blur', blurListener)
})
onUnmounted(() => {
  document.removeEventListener('visibilitychange', visibilitychangeListener)
  window.removeEventListener('focus', focusListener)
  window.removeEventListener('blur', blurListener)
})

const { onClick } = useMarkdownInternalHandler()
useScrollRestoration(rootRef, state)
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

.viewport {
  display: flex;
  flex-flow: column;
  // NOTE: bottomSpacer 分だけ除く
  min-height: calc(100% - 12px);
}

.element {
  margin: 4px 0;
  contain: content;
}

.bottomSpacer {
  width: 100%;
  height: 12px;
}

.noMoreSeparator {
  @include color-ui-secondary;
}
</style>
