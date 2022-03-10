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
import { nullUuid } from '/@/lib/basic/uuid'
import ShareTargetMessageInput from './ShareTargetMessageInput.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import usePostMessage from '/@/components/Main/MainView/MessageInput/use/postMessage'
import useChannelOptions from '/@/use/channelOptions'
import useMessageInputState from '/@/providers/messageInputState'
import { ChannelId } from '/@/types/entity-ids'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'

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
  emits: {
    post: () => true
  },
  setup(props, { emit }) {
    const { detail } = useMeStore()
    const homeChannelId = computed(() => detail.value?.homeChannel ?? nullUuid)

    const { fetchChannels } = useChannelsStore()
    // 投稿先チャンネルとメッセージでの置換に必要
    fetchChannels()
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
    const { fetchUsers } = useUsersStore()
    fetchUsers()
    const { fetchUserGroups } = useGroupsStore()
    fetchUserGroups()

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
        emit('post')
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
