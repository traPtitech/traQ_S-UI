<template>
  <div :class="$style.container">
    <MessagesSkeleton v-if="!ready" :class="$style.skeleton" />
    <div
      ref="rootRef"
      :class="[$style.root, !ready && $style.hidden]"
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
        <MessagesSkeleton
          v-if="!isReachedEnd"
          ref="topSkeletonRef"
          :simple="!enableProactiveLoading"
          instant
          :count="3"
          :class="$style.edgeSkeleton"
        />
        <MessagesScrollerSeparator
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
        <MessagesSkeleton
          v-if="enableProactiveLoading && !isReachedLatest"
          ref="bottomSkeletonRef"
          reversed
          instant
          :simple="!enableProactiveLoading"
          :count="3"
          :class="$style.edgeSkeleton"
        />
      </div>
      <div :class="$style.bottomSpacer" />
    </div>
  </div>
</template>

<script lang="ts">
import type { ComponentPublicInstance, Ref } from 'vue'
import { computed, nextTick, onMounted, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { unrefElement, useEventListener, useResizeObserver } from '@vueuse/core'
import { debounce, throttle } from 'throttle-debounce'

import { useOpenLink } from '/@/composables/useOpenLink'
import useResponsive from '/@/composables/useResponsive'
import { embeddingOrigin } from '/@/lib/apis'
import { isIOS } from '/@/lib/dom/browser'
import { toggleSpoiler } from '/@/lib/markdown/spoiler'
import { RouteName, isMessageScrollerRoute } from '/@/router'
import { useStampsStore } from '/@/store/entities/stamps'
import { useMainViewStore } from '/@/store/ui/mainView'
import type { MessageId } from '/@/types/entity-ids'

import MessagesSkeleton from './MessagesSkeleton.vue'
import useMessageScroller from './composables/useMessageScroller'
import type { LoadingDirection } from './composables/useMessagesFetcher'

export interface MessageScrollerInstance extends ComponentPublicInstance {
  rootRef: HTMLDivElement
}

const MIN_THRESHOLD = 1000 // 最小の閾値
const THRESHOLD_INCREMENT = 1500 // 端に到達するたびに増加させる閾値
const DECAY_PER_SECOND = 0.6 // 一秒あたりの減衰率

/**
 * 端に到達するたびに閾値を増加させ、時間経過で減衰する
 */
const useDynamicLoadThreshold = () => {
  let currentThreshold = MIN_THRESHOLD
  let lastTime = performance.now()
  let wasNearEdge = false

  const getThreshold = () => currentThreshold

  const update = (top: number, bottom: number) => {
    const now = performance.now()
    const deltaSeconds = (now - lastTime) / 1000
    lastTime = now

    // 端に近いかどうか判定
    const isNearEdge = top < currentThreshold || bottom < currentThreshold

    // 端に到達したら閾値を増やす
    if (isNearEdge && !wasNearEdge) {
      currentThreshold += THRESHOLD_INCREMENT
    } else {
      // 時間減衰を適用
      const decayFactor = Math.pow(DECAY_PER_SECOND, deltaSeconds)
      currentThreshold = Math.max(
        MIN_THRESHOLD,
        MIN_THRESHOLD + (currentThreshold - MIN_THRESHOLD) * decayFactor
      )
    }

    wasNearEdge = isNearEdge
  }

  return { getThreshold, update }
}

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
    () => route.name,
    async (to, from) => {
      if (isMessageScrollerRoute(from)) {
        lastScrollPosition.value = state.scrollTop
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
  (e: 'resetIsReachedLatest'): void
  (e: 'scrollPassive'): void
}>()

const { lastScrollPosition } = useMainViewStore()

// メッセージスタンプ表示時にスタンプが存在していないと
// 場所が確保されないくてずれてしまうので、取得完了を待つ
const { stampsMapFetched } = useStampsStore()

const rootRef = shallowRef<HTMLElement | null>(null)
const topSkeletonRef = shallowRef<ComponentPublicInstance | null>(null)
const bottomSkeletonRef = shallowRef<ComponentPublicInstance | null>(null)

// スケルトンの高さをキャッシュ（getBoundingClientRectの毎回呼び出しを回避）
const topSkeletonHeight = shallowRef(0)
const bottomSkeletonHeight = shallowRef(0)

// ResizeObserverでスケルトン高さを監視
useResizeObserver(
  () => topSkeletonRef.value?.$el,
  entries => {
    topSkeletonHeight.value =
      unrefElement(topSkeletonRef)?.getBoundingClientRect().height ?? 0
  }
)

useResizeObserver(
  () => bottomSkeletonRef.value?.$el,
  entries => {
    bottomSkeletonHeight.value =
      unrefElement(bottomSkeletonRef)?.getBoundingClientRect().height ?? 0
  }
)

const { isMobile } = useResponsive()
const enableProactiveLoading = computed(() => !isIOS() && !isMobile.value)

const { onChangeHeight, onEntryMessageLoaded, ready, state } =
  useMessageScroller(rootRef, props, topSkeletonHeight)

// 初期スクロール位置を設定
state.scrollTop = lastScrollPosition.value

onMounted(() => {
  // 表示されている
  if (stampsMapFetched.value) {
    state.height = rootRef.value?.scrollHeight ?? 0
  }
})

// マウント後にstampの取得が完了した場合
watch(
  stampsMapFetched,
  async fetched => {
    if (!fetched || !rootRef.value) return

    await nextTick()
    const scrollHeight = rootRef.value.scrollHeight
    rootRef.value.scrollTop = scrollHeight
    state.height = scrollHeight
    state.scrollTop = scrollHeight
  },
  {
    flush: 'post'
  }
)

const { getThreshold, update: updateThreshold } = useDynamicLoadThreshold()

const requestLoadMessages = () => {
  if (!rootRef.value) return
  state.scrollTop = rootRef.value.scrollTop

  const top = rootRef.value.scrollTop - topSkeletonHeight.value
  const bottom =
    rootRef.value.scrollHeight -
    (rootRef.value.scrollTop +
      rootRef.value.clientHeight +
      bottomSkeletonHeight.value)

  if (enableProactiveLoading.value) {
    updateThreshold(top, bottom)
  }

  const threshold = getThreshold()

  if (props.isLoading) return
  if (top < threshold && !props.isReachedEnd) {
    emit('requestLoadFormer')
  }
  if (bottom < threshold && !props.isReachedLatest) {
    emit('requestLoadLatter')
  }
}

const handleScroll = (enableProactiveLoading.value ? throttle : debounce)(
  enableProactiveLoading.value ? 24 : 200,
  requestLoadMessages
)

const visibilitychangeListener = () => {
  if (document.visibilityState === 'visible') {
    requestLoadMessages()
  }
  emit('resetIsReachedLatest')
}

useEventListener(document, 'visibilitychange', visibilitychangeListener)

const { onClick } = useMarkdownInternalHandler()
useScrollRestoration(rootRef, state)

defineExpose({ rootRef })
</script>

<style lang="scss" module>
.container {
  height: 100%;
  position: relative;
  overflow-y: hidden;
  padding: 12px 0;
}

.root {
  height: 100%;
  overflow-y: scroll;
  backface-visibility: hidden;
  contain: var(--contain-strict);
  // overflow-anchorはデフォルトでautoだが、Safariが対応していないので、
  // 手動で調節しているため明示的に無効化する
  overflow-anchor: none;
  // iOSで無限にロードが走るのを防止する
  -webkit-overflow-scrolling: auto;
  // scroll-behavior: auto;
  overscroll-behavior: none;
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

.skeleton {
  position: absolute;
  inset: 0;
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s ease-in;
  margin-bottom: 24px;

  &.hidden {
    opacity: 0;
    visibility: hidden;
  }
}

.hidden {
  visibility: hidden;
}

.edgeSkeleton {
  flex-shrink: 0;
}
</style>
