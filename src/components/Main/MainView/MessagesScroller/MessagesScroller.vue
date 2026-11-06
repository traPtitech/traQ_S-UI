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
  >
    <div
      v-if="stampsMapFetched"
      :class="$style.viewport"
      data-testid="channel-viewport"
    >
      <MessagesScrollerSeparator
        v-if="hasReachedOldest"
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
    <div :class="$style.bottomSpacer" />
  </div>
</template>

<script lang="ts">
import type { Ref } from 'vue'
import { nextTick, onMounted, reactive, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useEventListener } from '@vueuse/core'
import { throttle } from 'throttle-debounce'

import type { PageLoadKind } from '/@/composables/utils/usePagedList'
import { isMessageScrollerRoute } from '/@/router'
import { useStampsStore } from '/@/store/entities/stamps'
import { useMainViewStore } from '/@/store/ui/mainView'
import type { MessageId } from '/@/types/entity-ids'

import useMessageScrollerElementResizeObserver from './composables/useMessageScrollerElementResizeObserver'

export type { MessageScrollerInstance } from './types'

const LOAD_MORE_THRESHOLD = 10

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
    hasReachedOldest: boolean
    isCaughtUp: boolean
    isLoading?: boolean
    entryMessageId?: MessageId
    lastLoadKind: PageLoadKind
  }>(),
  {
    isLoading: false
  }
)

const emit = defineEmits<{
  (e: 'requestLoadOlder'): void
  (e: 'requestLoadNewer'): void
  (e: 'invalidateLatest'): void
  (e: 'scrollPassive'): void
}>()

const { lastScrollPosition } = useMainViewStore()

// メッセージスタンプ表示時にスタンプが存在していないと
// 場所が確保されないくてずれてしまうので、取得完了を待つ
const { stampsMapFetched } = useStampsStore()

const rootRef = shallowRef<HTMLElement | null>(null)

const state = reactive({
  height: 0,
  scrollTop: lastScrollPosition.value,
  // 古いメッセージを読み込むとき、読み込み開始直後は高さの調整を無効化する
  skipResizeAdjustment: false
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

watch(
  () => [props.messageIds.slice(), props.isLoading] as const,
  ([ids, isLoading], [prevIds, wasLoading]) => {
    if (!rootRef.value) return

    if (
      ids.length === prevIds.length &&
      ids.every((id, index) => id === prevIds[index])
    ) {
      // 空ページでも到達表示などによって高さが変わる場合がある。
      if (!isLoading) state.height = rootRef.value.scrollHeight

      return
    }

    /* state.height の更新を忘れないようにすること */

    const newHeight = rootRef.value.scrollHeight
    const currentIds = new Set(ids)
    const retainedIds = prevIds.filter(id => currentIds.has(id))

    const removedOnly =
      ids.length < prevIds.length &&
      ids.every((id, index) => retainedIds[index] === id)

    if (removedOnly) {
      state.height = newHeight

      return
    }

    const previousIds = new Set(prevIds)
    const retainedPreviousIds = ids.filter(id => previousIds.has(id))

    const insertedOnly =
      prevIds.length > 0 &&
      ids.length > prevIds.length &&
      prevIds.every((id, index) => retainedPreviousIds[index] === id)

    const liveInsertion = insertedOnly && !isLoading && !wasLoading

    if (liveInsertion) {
      const scrollBottom = rootRef.value.scrollTop + rootRef.value.clientHeight

      // 末尾付近を見ていた場合だけ新着メッセージへ追従する。
      if (state.height - 50 <= scrollBottom) {
        rootRef.value.scrollTo({ top: newHeight })
      }

      state.height = newHeight

      return
    }

    const prepended =
      prevIds.length > 0 &&
      ids.length > prevIds.length &&
      prevIds.every(
        (id, index) => ids[ids.length - prevIds.length + index] === id
      )

    if (prepended) {
      // 上への追加分だけ位置を補正し、同じ変更に対する高さ通知との二重調整を防ぐ。
      state.skipResizeAdjustment = true

      rootRef.value.scrollTo({
        top: rootRef.value.scrollTop + newHeight - state.height
      })

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          state.skipResizeAdjustment = false
        })
      })
    } else if (prevIds.length === 0 && props.lastLoadKind === 'latest') {
      rootRef.value.scrollTo({ top: newHeight })
    }

    state.height = newHeight
  },
  { flush: 'post' }
)

const requestLoadMessages = () => {
  if (!rootRef.value || !stampsMapFetched.value) return

  const { clientHeight, scrollHeight, scrollTop } = rootRef.value
  state.scrollTop = scrollTop

  if (props.isLoading || clientHeight <= 0) return

  if (state.scrollTop < LOAD_MORE_THRESHOLD && !props.hasReachedOldest) {
    emit('requestLoadOlder')
  }

  if (
    scrollHeight - state.scrollTop - clientHeight < LOAD_MORE_THRESHOLD &&
    !props.isCaughtUp
  ) {
    emit('requestLoadNewer')
  }
}

let lastCheckedMessageIds = props.messageIds

watch(
  () =>
    props.isLoading || !stampsMapFetched.value ? undefined : props.messageIds,
  messageIds => {
    if (!messageIds || messageIds === lastCheckedMessageIds) return

    lastCheckedMessageIds = messageIds
    requestLoadMessages()
  },
  { flush: 'post' }
)

const handleScroll = throttle(17, requestLoadMessages)

const visibilitychangeListener = () => {
  if (document.visibilityState === 'visible') {
    requestLoadMessages()
  }

  emit('invalidateLatest')
}

useEventListener(document, 'visibilitychange', visibilitychangeListener)

useScrollRestoration(rootRef, state)
</script>

<style lang="scss" module>
.root {
  height: 100%;
  overflow-y: scroll;
  padding: 12px 0;
  backface-visibility: hidden;
  contain: var(--contain-strict);
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
