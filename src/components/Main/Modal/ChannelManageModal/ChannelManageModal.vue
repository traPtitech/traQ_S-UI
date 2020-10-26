<template>
  <modal-frame
    title="チャンネル管理"
    :subtitle="subtitle"
    icon-name="hash"
    :class="$style.container"
  >
    <form-input label="チャンネル名" v-model="manageState.name" />
    <form-selector
      label="親チャンネル"
      v-model="manageState.parent"
      :options="channelOptions"
    />
    <label :class="$style.toggle">
      アーカイブ
      <toggle
        :enabled="manageState.archived"
        @input="manageState.archived = !manageState.archived"
      />
    </label>
    <label :class="$style.toggle">
      強制通知
      <toggle
        :enabled="manageState.force"
        @input="manageState.force = !manageState.force"
      />
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
import store from '@/store'
import useChannelPath from '@/use/channelPath'
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '@/components/UI/FormInput.vue'
import FormSelector from '@/components/UI/FormSelector.vue'
import Toggle from '@/components/UI/Toggle.vue'
import FormButton from '@/components/UI/FormButton.vue'
import { compareStringInsensitive } from '@/lib/util/string'
import apis from '@/lib/apis'
import { PatchChannelRequest } from '@traptitech/traq'
import { ChannelId } from '@/types/entity-ids'
import { nullUuid } from '@/lib/util/uuid'
import useStateDiff from '@/components/Settings/use/stateDiff'

const useChannelOptions = (props: { id: ChannelId }) => {
  const { channelIdToPathString } = useChannelPath()
  return computed(() =>
    [
      ...Object.values(store.state.entities.channels)
        .filter(channel => channel.id !== props.id)
        .map(channel => {
          return {
            key: channelIdToPathString(channel.id, true),
            value: channel.id
          }
        }),
      { key: '(root)', value: nullUuid }
    ].sort((a, b) => compareStringInsensitive(a.key, b.key))
  )
}

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
    const isManageEnabled = computed(() => hasDiff(manageState, channel))

    const channelOptions = useChannelOptions(props)

    return {
      manageState,
      manageChannel,
      subtitle,
      isManageEnabled,
      channelOptions
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
.toggle {
  @include color-ui-primary;
}
</style>
