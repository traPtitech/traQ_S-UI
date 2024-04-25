<template>
  <modal-frame title="チャンネル管理" :subtitle="subtitle" icon-name="hash">
    <form-input
      v-model="manageState.name"
      label="チャンネル名"
      :max-length="20"
      focus-on-mount
    />
    <form-selector
      v-model="manageState.parent"
      label="親チャンネル"
      :options="channelOptions"
    />
    <label :class="$style.toggle">
      アーカイブ
      <a-toggle v-model="manageState.archived" :disabled="!canToggleArchive" />
    </label>
    <p v-if="!canToggleArchive" :class="$style.cantToggleArchiveMessage">
      このチャンネルはアーカイブチャンネルの子チャンネルなので、アーカイブ状態を解除できません。
    </p>
    <label :class="$style.toggle">
      強制通知
      <a-toggle v-model="manageState.force" />
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
import type { Ref } from 'vue'
import { computed, reactive } from 'vue'
import useChannelPath from '/@/composables/useChannelPath'
import apis from '/@/lib/apis'
import type { PatchChannelRequest } from '@traptitech/traq'
import { nullUuid } from '/@/lib/basic/uuid'
import useStateDiff from '/@/components/Settings/composables/useStateDiff'
import useChannelOptions from '/@/composables/useChannelOptions'
import { isValidChannelName } from '/@/lib/validate'
import { canCreateChildChannel } from '/@/lib/channel'
import { useToastStore } from '/@/store/ui/toast'
import { useModalStore } from '/@/store/ui/modal'
import { useChannelsStore } from '/@/store/entities/channels'

const useManageChannel = (
  props: { id: string },
  state: PatchChannelRequest,
  oldState: Ref<Required<PatchChannelRequest>>
) => {
  const { popModal } = useModalStore()
  const { channelIdToPathString } = useChannelPath()
  const { addErrorToast } = useToastStore()

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

      await popModal()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('チャンネルの変更に失敗しました', e)

      addErrorToast('チャンネルの変更に失敗しました')
    }
  }
  return { manageChannel }
}
</script>

<script lang="ts" setup>
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import FormSelector from '/@/components/UI/FormSelector.vue'
import AToggle from '/@/components/UI/AToggle.vue'
import FormButton from '/@/components/UI/FormButton.vue'

const props = defineProps<{
  id: string
}>()

const { channelsMap } = useChannelsStore()
const channel = computed((): Required<PatchChannelRequest> => {
  const c = channelsMap.value.get(props.id)
  return {
    name: c?.name ?? '',
    parent: c?.parentId ?? nullUuid,
    archived: c?.archived ?? false,
    force: c?.force ?? false
  }
})
const { channelIdToPathString } = useChannelPath()
const subtitle = computed(() => channelIdToPathString(props.id, true))

const manageState = reactive({ ...channel.value })
const { manageChannel } = useManageChannel(props, manageState, channel)

const { hasDiff } = useStateDiff<PatchChannelRequest>()
const isManageEnabled = computed(
  () => isValidChannelName(manageState.name) && hasDiff(manageState, channel)
)

const { channelOptions: rawChannelOptions } = useChannelOptions(
  '(root)',
  undefined,
  true
)
const channelOptions = computed(() =>
  rawChannelOptions.value
    .filter(
      ({ value }) =>
        value !== props.id &&
        // アーカイブチャンネルのときのみ親チャンネルにアーカイブチャンネルを指定できる
        (channel.value.archived || !channelsMap.value.get(value)?.archived)
    )
    .filter(({ key }) => canCreateChildChannel(key))
    .map(({ key, value }) => ({
      key,
      value:
        // 同じチャンネル名の子チャンネルを持つチャンネルを親チャンネルとして選択できないようにする
        // ただし今の親チャンネルは選択できる
        value !== channel.value.parent &&
        channelsMap.value
          .get(value)
          ?.children.some(
            child => channelsMap.value.get(child)?.name === manageState.name
          )
          ? null
          : value
    }))
)
const canToggleArchive = computed(
  () => !channelsMap.value.get(channel.value.parent)?.archived
)
</script>

<style lang="scss" module>
.input {
  margin-bottom: 16px;
  width: 100%;
}
.cantToggleArchiveMessage {
  color: $theme-accent-error-default;
}
.button {
  display: block;
  margin-left: auto;
}
.toggle {
  @include color-ui-primary;
}
</style>
