<template>
  <div :class="['markdown-body', $style.content]" v-html="content" />
</template>

<script lang="ts">
import store from '/@/store'
import { MessageId } from '/@/types/entity-ids'
import { computed, defineComponent, PropType } from 'vue'

/**
 * メッセージIDからレンダリング済みMarkdownを表示するだけのコンポーネント
 *
 * メッセージをfetchする側でレンダリングをかける
 */
export default defineComponent({
  name: 'MessageMarkdown',
  props: {
    messageId: {
      type: String as PropType<MessageId>,
      required: true
    }
  },
  setup(props) {
    const content = computed(
      () =>
        store.state.domain.messagesView.renderedContentMap.get(
          props.messageId
        ) ?? ''
    )
    return { content }
  }
})
</script>

<style lang="scss" module>
.content {
  grid-area: message-contents;
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
  line-break: loose;
}
</style>
