<template>
  <div
    :class="$style.body"
    :style="styles.body"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    ref="bodyRef"
  >
    <user-icon
      :class="$style.userIcon"
      :user-id="state.message.userId"
      :size="40"
    />
    <message-header
      :class="$style.messageHeader"
      :user-id="state.message.userId"
      :created-at="state.message.createdAt"
      :updated-at="state.message.updatedAt"
    />
    <div :class="$style.messageContents">
      <div :class="['markdown-body', $style.content]" v-html="state.content" />
      <message-stamp-list
        :class="$style.stamps"
        v-if="state.message.stamps.length > 0"
        :message-id="props.messageId"
        :stamps="state.message.stamps"
      />
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
  SetupContext
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'
import { MessageId } from '@/types/entity-ids'
import useHover from '@/use/hover'
import UserIcon from '@/components/UI/UserIcon.vue'
import MessageHeader from './MessageHeader.vue'
import MessageStampList from './MessageStampList.vue'
import MessageFileList from './MessageFileList.vue'

type Props = {
  messageId: MessageId
}

export default defineComponent({
  name: 'MessageElement',
  components: { UserIcon, MessageHeader, MessageStampList, MessageFileList },
  props: {
    messageId: {
      type: String,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const { hoverState, onMouseEnter, onMouseLeave } = useHover(context)
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
    const styles = reactive({
      body: makeStyles(theme => {
        return {
          backgroundColor: hoverState.hover
            ? transparentize(theme.background.secondary, 0.6)
            : 'transparent'
        }
      })
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

    return { props, state, styles, onMouseEnter, onMouseLeave, bodyRef }
  }
})
</script>

<style lang="scss" module>
.body {
  display: grid;
  grid-template:
    'user-icon message-header'
    'user-icon message-contents'
    '... message-contents';
  grid-template-rows: 20px 1fr;
  grid-template-columns: 42px 1fr;
  width: 100%;
  min-width: 0;
  padding: 8px 32px;
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
}

.stamps {
  margin-top: 8px;
}

.messageFileList {
  margin-top: 16px;
}
</style>
