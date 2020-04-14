<template>
  <div ref="rootRef" :class="$style.root" @scroll.passive="handleScroll">
    <div :class="$style.viewport">
      <message-element
        :class="$style.element"
        v-for="messageId in messageIds"
        :key="messageId"
        :message-id="messageId"
        @change-height="onChangeHeight"
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
      isFirstView: computed(
        () =>
          store.state.domain.messagesView.loadedMessageOldestDate === undefined
      ),
      isLoading: false
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
        state.height = newHeight
        state.isLoading = false
      }
    )

    const handleScroll = throttle(async () => {
      if (!rootRef.value) return
      state.scrollTop = rootRef.value.scrollTop

      if (state.isFirstView || state.isLoading) return
      if (state.scrollTop < LOAD_MORE_THRESHOLD) {
        state.isLoading = true
        await store.dispatch.domain.messagesView.fetchAndRenderChannelFormerMessages()
      }
    }, 17)

    const onChangeHeight = (payload: {
      heightDiff: number
      top: number
      bottom: number
      lastTop: number
      lastBottom: number
    }) => {
      if (!rootRef.value) {
        return
      }
      // 画像読み込みで高さがずれた
      rootRef.value.scrollTop = rootRef.value.scrollTop + payload.heightDiff
      state.height += payload.heightDiff
    }

    return {
      state,
      rootRef,
      handleScroll,
      onChangeHeight
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
