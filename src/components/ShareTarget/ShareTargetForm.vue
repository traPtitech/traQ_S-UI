<template>
  <div :class="$style.container">
    <form-selector
      v-model="channelId"
      :class="$style.item"
      label="投稿先チャンネル"
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
import { defineComponent, computed, watch, ref } from 'vue'
import FormSelector from '/@/components/UI/FormSelector.vue'
import store from '/@/store'
import { nullUuid } from '/@/lib/util/uuid'
import ShareTargetMessageInput from './ShareTargetMessageInput.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import usePostMessage from '/@/components/Main/MainView/MessageInput/use/postMessage'
import useChannelOptions from '/@/use/channelOptions'
import useMessageInputState from '/@/providers/messageInputState'
import { ChannelId } from '/@/types/entity-ids'

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
      () => store.state.domain.me.detail?.homeChannel ?? nullUuid
    )

    // 投稿先チャンネルとメッセージでの置換に必要
    store.dispatch.entities.fetchChannels()
    const { channelOptions } = useChannelOptions('-----')

    const channelId = ref<ChannelId>(nullUuid)
    watch(
      homeChannelId,
      newVal => {
        channelId.value = newVal
      },
      { immediate: true }
    )

    // メッセージでの置換に必要
    store.dispatch.entities.fetchUsers()
    store.dispatch.entities.fetchUserGroups()

    // FIXME: 親子関係なのにprovide-injectを乱用してるの微妙
    const { state } = useMessageInputState('share-target')
    watch(
      () => props.defaultText,
      newVal => {
        state.text = newVal
      },
      { immediate: true }
    )
    const { postMessage, isPosting } = usePostMessage(channelId, 'share-target')
    const post = async () => {
      const posted = await postMessage()
      if (posted) {
        context.emit('post')
      }
    }

    return { channelId, state, channelOptions, post, isPosting }
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
