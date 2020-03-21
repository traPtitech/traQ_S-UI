<template>
  <div ref="rootRef" :class="$style.root" @scroll.passive="handleScroll">
    <div :class="$style.viewport">
      <message-element
        v-for="messageId in props.messageIds"
        :key="messageId"
        :messageId="messageId"
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
  onMounted
} from '@vue/composition-api'
import { MessageId } from '@/types/entity-ids'
import store from '@/store'
import MessageElement from './MessageElement/MessageElement.vue'
import { throttle } from 'lodash-es'

interface Props {
  messageIds: MessageId[]
}

const LOAD_MORE_THRESHOLD = 10

export default defineComponent({
  name: 'MessagesScroller',
  components: {
    MessageElement
  },
  props: {
    messageIds: {
      type: Array,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const state = reactive({
      height: 0,
      scrollTop: 0,
      isFirstView: computed(
        () => store.state.domain.messagesView.currentOffset === 0
      ),
      isLoading: false
    })
    const rootRef = ref<HTMLElement>(null)

    onMounted(() => {
      state.height = rootRef.value?.scrollHeight ?? 0
    })

    watch(
      () => props.messageIds,
      async () => {
        if (!rootRef.value) return
        await context.root.$nextTick()
        const newHeight = rootRef.value.scrollHeight
        rootRef.value.scrollTo({
          top: state.isFirstView ? newHeight : newHeight - state.height
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
        await store.dispatch.domain.messagesView.fetchChannelMessages()
      }
    }, 17)

    return {
      props,
      state,
      rootRef,
      handleScroll
    }
  }
})
</script>

<style lang="scss" module>
.root {
  height: 100%;
  overflow-y: scroll;
  overflow-anchor: none;
  padding: 12px 32px;
}

.viewport {
  display: flex;
  flex-flow: column;
  justify-content: flex-end;
  min-height: 100%;
}
</style>
