<template>
  <modal-frame
    title="チャンネル作成"
    :subtitle="subtitle"
    icon-name="hash"
    :class="$style.container"
  >
    <form-input
      label="チャンネル名"
      :class="$style.input"
      v-model="channelName"
    />
    <form-button label="作成" :class="$style.button" @click="createChannel" />
  </modal-frame>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  Ref,
  SetupContext
} from '@vue/composition-api'
import store from '@/store'
import useChannelPath from '@/use/channelPath'
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '@/components/UI/FormInput.vue'
import FormButton from '@/components/UI/FormButton.vue'
import { changeChannelById } from '@/router/channel'

const useCreateChannel = (
  props: { parentChannelId?: string },
  context: SetupContext,
  channelNameRef: Ref<string>
) => {
  const createChannel = async () => {
    const { channelIdToPathString } = useChannelPath()
    try {
      const channel = await store.dispatch.entities.createChannel({
        name: channelNameRef.value,
        parent: props.parentChannelId ?? null
      })

      // 新規作成なのでホームチャンネルにならないため、全体のみ再構築
      await store.dispatch.domain.channelTree.constructChannelTree()

      await store.dispatch.ui.modal.popModal()
      changeChannelById(channel.id)
    } catch {
      // TODO: エラー処理
    }
  }
  return { createChannel }
}

export default defineComponent({
  name: 'ChannelCreateModal',
  components: {
    ModalFrame,
    FormInput,
    FormButton
  },
  props: {
    parentChannelId: String
  },
  setup(props, context) {
    const channelName = ref('')
    const { createChannel } = useCreateChannel(props, context, channelName)
    const { channelIdToPathString } = useChannelPath()
    const subtitle = computed(() =>
      props.parentChannelId
        ? channelIdToPathString(props.parentChannelId, true)
        : 'ルートチャンネル作成'
    )
    return { channelName, createChannel, subtitle }
  }
})
</script>

<style lang="scss" module>
.input {
  margin-bottom: 16px;
  width: 100%;
}
.button {
  display: block;
  margin-left: auto;
}
</style>
