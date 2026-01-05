<template>
  <div ref="rootRef" :class="$style.root" @click="onClick">
    <MessagesScrollerSeparator
      v-if="isReachedEnd"
      title="これ以上メッセージはありません"
      :class="$style.noMoreSeparator"
    />
    <Virtualizer
      ref="scrollerRef"
      :buffer-size="100000"
      :start-margin="32"
      :data="messageIds"
      :shift="prepend"
      :class="$style.scroller"
      @scroll="handleVirtualScroll"
    >
      <template #default="{ item: messageId }">
        <slot :key="messageId" :message-id="messageId" />
      </template>
    </Virtualizer>
    <div :style="{ height: `${FOOTER_HEIGHT}px` }" />
  </div>
</template>

<script lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { nextTick, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import { useEventListener, watchArray, watchImmediate } from '@vueuse/core'
import { throttle } from 'throttle-debounce'
import { Virtualizer } from 'virtua/vue'

import { useOpenLink } from '/@/composables/useOpenLink'
import { embeddingOrigin } from '/@/lib/apis'
import { defer } from '/@/lib/basic/timer'
import { isWebKit } from '/@/lib/dom/browser'
import { toggleSpoiler } from '/@/lib/markdown/spoiler'
import { RouteName } from '/@/router'
import { useStampsStore } from '/@/store/entities/stamps'
import type { MessageId } from '/@/types/entity-ids'
import type { Invocable } from '/@/types/utility'

import MessagesScrollerSeparator from './MessagesScrollerSeparator.vue'
import type { LoadingDirection } from './composables/useMessagesFetcher'

export interface MessageScrollerInstance extends ComponentPublicInstance {
  $el: HTMLDivElement
  scrollToBottom: Invocable
}

const FOOTER_HEIGHT = 12

const STICK_TO_BOTTOM_THRESHOLD = 50
const LOAD_MORE_THRESHOLD = 100

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
</script>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    id: string
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
  (e: 'resetIsReachedLatest'): void
  (e: 'scroll'): void
}>()

const prepend = ref(false)

// メッセージスタンプ表示時にスタンプが存在していないと
// 場所が確保されないくてずれてしまうので、取得完了を待つ
const { stampsMapInitialFetchPromise } = useStampsStore()

const rootRef = shallowRef<HTMLDivElement>()
const scrollerRef = shallowRef<InstanceType<typeof Virtualizer>>()

let initialScrolled = false
let shouldStickToBottom = false

const scrollToBottom = async () => {
  const impl = () => {
    if (!scrollerRef.value) return

    // 最新付近のメッセージのロード後に高さが変動してしまう場合があるので，
    // 余裕をもって多めに scroll を schedule する．
    const { scrollSize, viewportSize } = scrollerRef.value
    scrollerRef.value.scrollTo(scrollSize + viewportSize + FOOTER_HEIGHT)
  }

  await nextTick().then(impl)
  defer().then(impl)
}

const stopMomentumScroll = () => {
  const root = rootRef.value
  if (!root) return

  root.style.overflowY = 'hidden'
  defer(() => (root.style.overflowY = 'auto'))
}

watchImmediate(
  () => props.id,
  () => {
    initialScrolled = false
  },
  { flush: 'sync' }
)

watchArray(
  () => props.messageIds,
  async ids => {
    await nextTick()
    prepend.value = false

    if (ids.length === 0) return
    if (!scrollerRef.value) return

    if (!initialScrolled) {
      await stampsMapInitialFetchPromise

      if (props.lastLoadingDirection === 'around') {
        if (!props.entryMessageId) return

        await nextTick()
        scrollerRef.value.scrollToIndex(
          props.messageIds.indexOf(props.entryMessageId),
          { align: 'center' }
        )
      }

      if (props.lastLoadingDirection === 'latest') {
        await scrollToBottom()
      }

      initialScrolled = true
    }

    if (shouldStickToBottom) {
      await scrollToBottom()
    }
  },
  { deep: true, flush: 'post' }
)

const requestLoadMessages = () => {
  if (!scrollerRef.value) return
  if (props.isLoading) return
  if (!initialScrolled) return

  const { scrollOffset, scrollSize, viewportSize } = scrollerRef.value

  const bottomOffset = scrollSize - scrollOffset - viewportSize

  shouldStickToBottom =
    props.isReachedLatest &&
    bottomOffset + FOOTER_HEIGHT < STICK_TO_BOTTOM_THRESHOLD

  if (scrollOffset < LOAD_MORE_THRESHOLD && !props.isReachedEnd) {
    prepend.value = true
    if (isWebKit) stopMomentumScroll()
    emit('requestLoadFormer')
  }

  if (bottomOffset < LOAD_MORE_THRESHOLD && !props.isReachedLatest) {
    emit('requestLoadLatter')
  }
}

const handleVirtualScroll = throttle(17, (offset: number) => {
  requestLoadMessages()
  emit('scroll')
})

const visibilitychangeListener = () => {
  if (document.visibilityState === 'visible') {
    requestLoadMessages()
  }
  emit('resetIsReachedLatest')
}

useEventListener(document, 'visibilitychange', visibilitychangeListener)

const { onClick } = useMarkdownInternalHandler()

defineExpose({ scrollToBottom })
</script>

<style lang="scss" module>
.root {
  height: 100%;
  padding: 12px 0;
  overflow-y: auto;
  backface-visibility: hidden;
  overscroll-behavior-block: none;
  contain: var(--contain-strict);
  // overflow-anchorはデフォルトでautoだが、Safariが対応していないので、
  // 手動で調節しているため明示的に無効化する
  overflow-anchor: none;
  // iOSで無限にロードが走るのを防止する
  -webkit-overflow-scrolling: auto;
}

.scroller {
  height: 100%;

  & [data-last-child] {
    margin-bottom: 16px;
  }
}

.bottomSpacer {
  width: 100%;
}

.noMoreSeparator {
  @include color-ui-secondary;
}
</style>
