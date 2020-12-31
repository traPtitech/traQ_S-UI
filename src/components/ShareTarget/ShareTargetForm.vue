<template>
  <div :class="$style.container">
    <form-selector
      :class="$style.item"
      label="投稿先チャンネル"
      v-model="channelState.channelId"
      :options="channelOptions"
    />
    <share-target-message-input :class="[$style.item, $style.input]" />
    <form-button
      :class="[$style.item, $style.button]"
      label="送信"
      :loading="isPosting"
      @click="post"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, watch } from 'vue'
import FormSelector from '@/components/UI/FormSelector.vue'
import _store from '@/_store'
import store from '@/store'
import { nullUuid } from '@/lib/util/uuid'
import ShareTargetMessageInput from './ShareTargetMessageInput.vue'
import FormButton from '@/components/UI/FormButton.vue'
import usePostMessage from '@/components/Main/MainView/MessageInput/use/postMessage'
import useChannelOptions from '@/use/channelOptions'
import useMessageInputState from '@/use/messageInputState'

export default defineComponent({
  name: 'ShareTargetForm',
  components: {
    FormSelector,
    ShareTargetMessageInput,
    FormButton
  },
  props: {
    defaultText: {
      type: String,
      required: true
    }
  },
  setup(props, context) {
    const homeChannelId = computed(
      () => _store.state.domain.me.detail?.homeChannel ?? nullUuid
    )

    store.dispatch.entities.fetchChannels()
    const { channelOptions } = useChannelOptions('-----')

    const channelState = reactive({
      channelId: nullUuid
    })
    watch(
      homeChannelId,
      newVal => {
        channelState.channelId = newVal
      },
      { immediate: true }
    )

    // FIXME: 親子関係なのにprovide-injectを乱用してるの微妙
    const { state } = useMessageInputState()
    watch(
      () => props.defaultText,
      newVal => {
        state.text = newVal
      },
      { immediate: true }
    )
    const { postMessage, isPosting } = usePostMessage(channelState)
    const post = async () => {
      const posted = await postMessage()
      if (posted) {
        context.emit('post')
      }
    }

    return { channelState, state, channelOptions, post, isPosting }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  padding: 16px;
  flex-direction: column;
}
.item {
  margin: 8px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.input {
  flex: 1;
}
.button {
  align-self: flex-end;
}
</style>
