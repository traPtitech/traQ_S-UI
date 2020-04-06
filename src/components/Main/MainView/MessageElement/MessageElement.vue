<template>
  <div :class="$style.body" ref="bodyRef">
    <user-icon
      :class="$style.userIcon"
      :userId="state.message.userId"
      :size="40"
    />
    <message-header
      :class="$style.messageHeader"
      :userId="state.message.userId"
      :createdAt="state.message.createdAt"
      :updatedAt="state.message.updatedAt"
    />
    <div :class="$style.messageContents">
      <div :class="['markdown-body', $style.content]" v-html="state.content" />
      <message-file-list
        v-if="state.fileIds.length > 0"
        :class="$style.messageFileList"
        :fileIds="state.fileIds"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  ref,
  onMounted,
  watchEffect,
  watch,
  SetupContext,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import UserIcon from '@/components/UI/UserIcon.vue'
import MessageHeader from './MessageHeader.vue'
import MessageFileList from './MessageFileList.vue'
import { MessageId } from '@/types/entity-ids'

export default defineComponent({
  name: 'MessageElement',
  components: { UserIcon, MessageHeader, MessageFileList },
  props: {
    messageId: {
      type: String as PropType<MessageId>,
      required: true
    }
  },
  setup(props, context: SetupContext) {
    const bodyRef = ref<HTMLDivElement>(null)
    const state = reactive({
      message: computed(() => store.state.entities.messages[props.messageId]),
      content: computed(
        () =>
          store.state.domain.messagesView.renderedContentMap[props.messageId] ??
          ''
      ),
      fileIds: computed(() =>
        store.state.domain.messagesView.embeddedFilesMap[props.messageId].map(
          e => e.id
        )
      )
    })

    let lastHeight = 0
    let lastBottom = 0
    let lastTop = 0
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0]
      if (lastHeight === 0) {
        // 初回に高さが変化した場合、初期レンダリング完了とみなして処理を飛ばす
        // これ以降新規にobserveしないためにwatcherを止める
        lastHeight = entry.contentRect.height
        stop()
      } else {
        const height = entry.contentRect.height
        const bottom = entry.contentRect.bottom
        const top = entry.contentRect.top
        context.emit('change-height', {
          heightDiff: height - lastHeight,
          top,
          bottom,
          lastTop,
          lastBottom
        })
        lastHeight = height
        lastBottom = bottom
        lastTop = top
      }
    })
    const stop = watchEffect(async () => {
      if (
        state.content.length > 0 &&
        state.fileIds.length > 0 &&
        bodyRef.value
      ) {
        // 添付ファイルがある場合は高さ監視をする
        resizeObserver.observe(bodyRef.value)
      }
    })
    watch(
      () => context.root.$route.path,
      () =>
        // パス変更でunobserve
        // vue-routerのインスタンス再利用対策
        bodyRef.value ? resizeObserver.unobserve(bodyRef.value) : undefined
    )

    return { state, bodyRef }
  }
})
</script>

<style lang="scss" module>
.body {
  display: grid;
  grid-template-areas:
    'user-icon message-header'
    'user-icon message-contents'
    '... message-contents';
  grid-template-rows: 20px 1fr;
  grid-template-columns: 42px 1fr;
  width: 100%;
  min-width: 0;
  padding: 8px 0;
  overflow: hidden;
}

.userIcon {
  grid-area: user-icon;
  margin-top: 2px;
}

.messageHeader {
  grid-area: message-header;
  padding-left: 8px;
}

.messageContents {
  grid-area: message-contents;
  padding-top: 4px;
  padding-left: 8px;
  min-width: 0;
}

.content {
  grid-area: message-contents;
  word-break: break-word;
  word-wrap: break-word;
  line-break: loose;

  & pre {
    white-space: pre-wrap;
  }
}

.messageFileList {
  margin-top: 16px;
}
</style>
