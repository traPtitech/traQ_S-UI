<template>
  <div :class="$style.container">
    <form-selector
      :class="$style.item"
      label="投稿先チャンネル"
      v-model="state.channelId"
      :options="channelOptions"
    />
    <ShareTargetMessageInput
      :class="[$style.item, $style.input]"
      v-model="state.text"
    />
    <form-button
      :class="[$style.item, $style.button]"
      label="送信"
      :loading="isPosting"
      @click="post"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  watch
} from '@vue/composition-api'
import FormSelector from '@/components/UI/FormSelector.vue'
import useChannelPath from '@/use/channelPath'
import store from '@/store'
import { compareStringInsensitive } from '@/lib/util/string'
import { nullUuid } from '@/lib/util/uuid'
import ShareTargetMessageInput from './ShareTargetMessageInput.vue'
import FormButton from '@/components/UI/FormButton.vue'
import usePostMessage from '@/components/Main/MainView/MessageInput/use/postMessage'

const useChannelOptions = () => {
  const { channelIdToPathString } = useChannelPath()

  store.dispatch.entities.fetchChannels()

  return computed(() =>
    [
      ...Object.values(store.state.entities.channels).map(channel => ({
        key: channelIdToPathString(channel.id, true),
        value: channel.id
      })),
      { key: '-----', value: nullUuid }
    ].sort((a, b) => compareStringInsensitive(a.key, b.key))
  )
}

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
    const channelOptions = useChannelOptions()

    const state = reactive({
      channelId: nullUuid,
      text: '',
      isEmpty: computed((): boolean => state.text === '')
    })
    watch(
      () => homeChannelId.value,
      newVal => {
        state.channelId = newVal
      },
      { immediate: true }
    )
    watch(
      () => props.defaultText,
      newVal => {
        state.text = newVal
      },
      { immediate: true }
    )

    const { postMessage, isPosting } = usePostMessage(state, state)
    const post = async () => {
      const posted = await postMessage()
      if (posted) {
        context.emit('post')
      }
    }

    return { state, channelOptions, post, isPosting }
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
