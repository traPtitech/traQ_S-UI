<template>
  <modal-frame title="チャンネル管理" :subtitle="subtitle" icon-name="hash">
    <form-input
      label="チャンネル名"
      v-model="manageState.name"
      :max-length="20"
    />
    <form-selector
      label="親チャンネル"
      v-model="manageState.parent"
      :options="channelOptions"
    />
    <label :class="$style.toggle">
      アーカイブ
      <toggle v-model="manageState.archived" :disabled="!canToggleArchive" />
    </label>
    <p v-if="!canToggleArchive" :class="$style.cantToggleArchiveMessage">
      このチャンネルはアーカイブチャンネルの子チャンネルなので、アーカイブ状態を解除できません。
    </p>
    <label :class="$style.toggle">
      強制通知
      <toggle v-model="manageState.force" />
    </label>
    <form-button
      label="変更"
      :disabled="!isManageEnabled"
      :class="$style.button"
      @click="manageChannel"
    />
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, computed, SetupContext, reactive, Ref } from 'vue'
import store from '@/_store'
import useChannelPath from '@/use/channelPath'
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '@/components/UI/FormInput.vue'
import FormSelector from '@/components/UI/FormSelector.vue'
import Toggle from '@/components/UI/Toggle.vue'
import FormButton from '@/components/UI/FormButton.vue'
import apis from '@/lib/apis'
import { PatchChannelRequest } from '@traptitech/traq'
import { nullUuid } from '@/lib/util/uuid'
import useStateDiff from '@/components/Settings/use/stateDiff'
import useChannelOptions from '@/use/channelOptions'
import { isValidChannelName } from '@/lib/validate'

const useManageChannel = (
  props: { id: string },
  context: SetupContext,
  state: PatchChannelRequest,
  oldState: Ref<Required<PatchChannelRequest>>
) => {
  const { channelIdToPathString } = useChannelPath()

  const manageChannel = async () => {
    const channelPath = channelIdToPathString(props.id)
    if (!confirm(`本当に#${channelPath}を変更しますか？`)) {
      return
    }

    try {
      const reqJson = { ...state }
      if (state.name === oldState.value.name) {
        reqJson.name = undefined
      }
      if (state.parent === oldState.value.parent) {
        reqJson.parent = undefined
      }
      await apis.editChannel(props.id, reqJson)

      await store.dispatch.ui.modal.popModal()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('チャンネルの変更に失敗しました', e)

      store.commit.ui.toast.addToast({
        type: 'error',
        text: 'チャンネルの変更に失敗しました'
      })
    }
  }
  return { manageChannel }
}

export default defineComponent({
  name: 'ChannelManageModal',
  components: {
    ModalFrame,
    Toggle,
    FormInput,
    FormSelector,
    FormButton
  },
  props: {
    id: { type: String, required: true }
  },
  setup(props, context) {
    const channel = computed(
      (): Required<PatchChannelRequest> => {
        const c = store.state.entities.channels[props.id]
        return {
          name: c.name,
          parent: c.parentId ?? nullUuid,
          archived: c.archived,
          force: c.force
        }
      }
    )
    const { channelIdToPathString } = useChannelPath()
    const subtitle = computed(() => channelIdToPathString(props.id, true))

    const manageState = reactive({ ...channel.value })
    const { manageChannel } = useManageChannel(
      props,
      context,
      manageState,
      channel
    )

    const { hasDiff } = useStateDiff<PatchChannelRequest>()
    const isManageEnabled = computed(
      () =>
        isValidChannelName(manageState.name) && hasDiff(manageState, channel)
    )

    const { channelOptions: rawChannelOptions } = useChannelOptions('(root)')
    const channelOptions = computed(() =>
      rawChannelOptions.value.filter(
        ({ value }) =>
          value !== props.id &&
          // アーカイブチャンネルのときのみ親チャンネルにアーカイブチャンネルを指定できる
          (channel.value.archived ||
            !store.state.entities.channels[value]?.archived)
      )
    )
    const canToggleArchive = computed(
      () => !store.state.entities.channels[channel.value.parent]?.archived
    )

    return {
      manageState,
      manageChannel,
      subtitle,
      isManageEnabled,
      channelOptions,
      canToggleArchive
    }
  }
})
</script>

<style lang="scss" module>
.input {
  margin-bottom: 16px;
  width: 100%;
}
.cantToggleArchiveMessage {
  color: $theme-accent-error;
}
.button {
  display: block;
  margin-left: auto;
}
.toggle {
  @include color-ui-primary;
}
</style>
