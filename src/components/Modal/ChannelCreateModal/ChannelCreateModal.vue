<template>
  <modal-frame
    :title="title"
    :subtitle="subtitle"
    icon-name="hash"
    :class="$style.container"
  >
    <form-selector
      v-if="parentChannelId === undefined"
      label="親チャンネル"
      v-model="state.parentChannelId"
      :options="channelOptions"
    />
    <form-input
      label="チャンネル名"
      :class="$style.input"
      v-model="state.channelName"
    />
    <form-button
      label="作成"
      :disabled="!isCreateEnabled"
      :class="$style.button"
      @click="createChannel"
    />
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, watch, toRef } from 'vue'
import store from '@/store'
import useChannelPath from '@/use/channelPath'
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '@/components/UI/FormInput.vue'
import FormButton from '@/components/UI/FormButton.vue'
import { changeChannelById } from '@/router/channel'
import { rootChannelId } from '@/store/domain/channelTree/state'
import { ChannelId } from '@/types/entity-ids'
import useChannelOptions from '@/use/channelOptions'
import FormSelector from '@/components/UI/FormSelector.vue'

interface State {
  channelName: string
  parentChannelId: ChannelId
}

const useCreateChannel = (state: State) => {
  const { channelIdToPathString } = useChannelPath()

  const createChannel = async () => {
    const parentChannelPath =
      state.parentChannelId !== rootChannelId
        ? channelIdToPathString(state.parentChannelId)
        : ''
    if (
      !confirm(
        `本当に#${
          parentChannelPath + state.channelName
        }を作成しますか？ (チャンネルの削除や移動、チャンネル名の変更はできません。)`
      )
    ) {
      return
    }

    try {
      const channel = await store.dispatch.entities.createChannel({
        name: state.channelName,
        parent: state.parentChannelId
      })

      // 新規作成なのでホームチャンネルにならないため、全体のみ再構築
      await store.dispatch.domain.channelTree.constructChannelTree()

      await store.dispatch.ui.modal.popModal()
      changeChannelById(channel.id)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('チャンネル作成に失敗しました', e)

      store.commit.ui.toast.addToast({
        type: 'error',
        text: 'チャンネル作成に失敗しました'
      })
    }
  }
  return { createChannel }
}

export default defineComponent({
  name: 'ChannelCreateModal',
  components: {
    ModalFrame,
    FormInput,
    FormButton,
    FormSelector
  },
  props: {
    /**
     * 指定しなかったときは親チャンネルを画面で指定可能
     */
    parentChannelId: {
      type: String,
      default: undefined
    }
  },
  setup(props) {
    const state = reactive<State>({
      channelName: '',
      parentChannelId: props.parentChannelId ?? rootChannelId
    })
    watch(
      toRef(props, 'parentChannelId'),
      newParentChannelId => {
        state.parentChannelId = newParentChannelId ?? rootChannelId
      },
      { immediate: true }
    )

    const { channelOptions } = useChannelOptions('(root)')
    const { createChannel } = useCreateChannel(state)

    const { channelIdToPathString } = useChannelPath()
    const title = computed(
      () => (props.parentChannelId ? '子' : '') + 'チャンネルを作成'
    )
    const subtitle = computed(() =>
      props.parentChannelId
        ? channelIdToPathString(props.parentChannelId, true)
        : ''
    )
    const isCreateEnabled = computed(() => state.channelName !== '')

    return {
      state,
      channelOptions,
      createChannel,
      title,
      subtitle,
      isCreateEnabled
    }
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
