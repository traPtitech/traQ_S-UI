<template>
  <div
    :class="$style.body"
    :style="styles.body"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
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
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import UserIcon from '@/components/UI/UserIcon.vue'
import MessageHeader from './MessageHeader.vue'
import MessageStampList from './MessageStampList.vue'
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'
import { MessageId } from '@/types/entity-ids'
import useHover from '@/use/hover'

type Props = {
  messageId: MessageId
}

export default defineComponent({
  name: 'MessageElement',
  components: { UserIcon, MessageHeader, MessageStampList },
  props: {
    messageId: {
      type: String,
      required: true
    }
  },
  setup(props: Props, context) {
    const { hoverState, onMouseEnter, onMouseLeave } = useHover(context)
    const state = reactive({
      message: computed(() => store.state.entities.messages[props.messageId]),
      content: computed(
        () =>
          store.state.domain.messagesView.renderedContentMap[props.messageId] ??
          ''
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

    return { props, state, styles, onMouseEnter, onMouseLeave }
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
</style>
