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
      :text="channelName"
      @input="setChannelName"
    />
    <form-button label="作成" :class="$style.button" @click="createChannel" />
  </modal-frame>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  ref,
  Ref
} from '@vue/composition-api'
import store from '@/store'
import api from '@/lib/api'
import { makeStyles } from '@/lib/styles'
import useChannelPath from '@/use/channelPath'
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '@/components/UI/FormInput.vue'
import FormButton from '@/components/UI/FormButton.vue'

const useChannelCreateForm = () => {
  const channelName = ref('')
  const setChannelName = (input: string) => (channelName.value = input)
  return { channelName, setChannelName }
}

const useCreateChannel = (
  props: { parentChannelId?: string },
  channelNameRef: Ref<string>
) => {
  const createChannel = () => {
    api.createChannel({
      name: channelNameRef.value,
      parent: props.parentChannelId ?? null
    })
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
  setup(props) {
    const { channelName, setChannelName } = useChannelCreateForm()
    const { createChannel } = useCreateChannel(props, channelName)
    const { channelIdToPath } = useChannelPath()
    const subtitle = computed(() =>
      props.parentChannelId
        ? '#' + channelIdToPath(props.parentChannelId).join('/')
        : 'ルートチャンネル作成'
    )
    return { channelName, setChannelName, createChannel, subtitle }
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
