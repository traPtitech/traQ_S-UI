<template>
  <modal-frame :title="title" :subtitle="subtitle" icon-name="hash">
    <form-selector
      v-if="parentChannelId === undefined"
      v-model="state.parentChannelId"
      label="親チャンネル"
      :options="channelOptions"
    />
    <form-input
      v-model="state.channelName"
      label="チャンネル名"
      :class="$style.input"
      :max-length="20"
      focus-on-mount
    />
    <p :class="$style.desc">
      実行すると
      <span :class="$style.newChannelPath">{{ newChannelPath }}</span>
      が新たに作成されます。(作成後のチャンネルの削除や移動、チャンネル名の変更はできません。)
    </p>
    <form-button
      label="作成"
      :disabled="!isCreateEnabled"
      :class="$style.button"
      @click="createChannel"
    />
  </modal-frame>
</template>

<script lang="ts">
import { computed, reactive, watch, toRef } from 'vue'
import useChannelPath from '/@/composables/useChannelPath'
import { rootChannelId } from '/@/lib/channelTree'
import type { ChannelId } from '/@/types/entity-ids'
import useChannelOptions from '/@/composables/useChannelOptions'
import { UserPermission } from '@traptitech/traq'
import useCanCreateChildChannel from '/@/composables/modal/useCanCreateChildChannel'
import { isValidChannelName } from '/@/lib/validate'
import apis from '/@/lib/apis'
import { channelTreeMitt } from '/@/store/domain/channelTree'
import { useToastStore } from '/@/store/ui/toast'
import { constructChannelPath } from '/@/router'
import { useRouter } from 'vue-router'
import { useModalStore } from '/@/store/ui/modal'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'

interface State {
  channelName: string
  parentChannelId: ChannelId | null
}

const useCreateChannel = (state: State) => {
  const router = useRouter()
  const { popModal } = useModalStore()
  const { addErrorToast } = useToastStore()
  const { addChannel } = useChannelsStore()

  const obtainChannelPath = (channelId: ChannelId) =>
    new Promise<string>(resolve => {
      const onCreated = ({ id, path }: { id: ChannelId; path: string }) => {
        if (id !== channelId) return

        resolve(path)
        channelTreeMitt.off('created', onCreated)
      }
      channelTreeMitt.on('created', onCreated)
    })

  const createChannel = async () => {
    if (state.parentChannelId === null) return
    if (
      !confirm(
        `本当に作成しますか？ (チャンネルの削除や移動、チャンネル名の変更はできません。)`
      )
    ) {
      return
    }

    try {
      const { data: channel } = await apis.createChannel({
        name: state.channelName,
        parent: state.parentChannelId
      })

      const pathObtainPromise = obtainChannelPath(channel.id)
      await addChannel({ channelId: channel.id })
      const path = await pathObtainPromise

      await popModal()
      router.push(constructChannelPath(path))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('チャンネル作成に失敗しました', e)

      addErrorToast('チャンネル作成に失敗しました')
    }
  }
  return { createChannel }
}

const useChannelOptionsForSelector = () => {
  const { detail } = useMeStore()

  const hasChannelEditPermission = computed(() =>
    detail.value?.permissions.includes(UserPermission.EditChannel)
  )
  const rootChannel = computed(() =>
    window.traQConfig.isRootChannelSelectableAsParentChannel ||
    hasChannelEditPermission.value
      ? '(root)'
      : undefined
  )

  const { canCreateChildChannel } = useCanCreateChildChannel()
  const { channelOptions: rawChannelOptions } = useChannelOptions(rootChannel)
  const channelOptions = computed(() =>
    [{ key: '-----', value: null }, ...rawChannelOptions.value].filter(
      ({ value }) => value === null || canCreateChildChannel(value)
    )
  )
  return { channelOptions }
}
</script>

<script lang="ts" setup>
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import FormSelector from '/@/components/UI/FormSelector.vue'

const props = defineProps<{
  parentChannelId?: string
}>()

const state = reactive<State>({
  channelName: '',
  parentChannelId: props.parentChannelId ?? null
})
watch(
  toRef(props, 'parentChannelId'),
  newParentChannelId => {
    state.parentChannelId = newParentChannelId ?? null
  },
  { immediate: true }
)

const { channelOptions } = useChannelOptionsForSelector()
const { createChannel } = useCreateChannel(state)

const { channelIdToPathString } = useChannelPath()
const title = computed(
  () => (props.parentChannelId ? '子' : '') + 'チャンネルを作成'
)
const subtitle = computed(() =>
  props.parentChannelId
    ? `${channelIdToPathString(props.parentChannelId, true)}/`
    : ''
)
const newChannelPath = computed(() => {
  if (
    state.parentChannelId === null ||
    state.parentChannelId === rootChannelId
  ) {
    return `#${state.channelName}`
  }
  const parentChannelPath = channelIdToPathString(state.parentChannelId)
  return `#${parentChannelPath}/${state.channelName}`
})

const isCreateEnabled = computed(
  () => isValidChannelName(state.channelName) && state.parentChannelId !== null
)
</script>

<style lang="scss" module>
.input {
  margin-bottom: 16px;
  width: 100%;
}
.desc {
  @include color-ui-secondary;
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
}
.newChannelPath {
  font-weight: bold;
}
.button {
  display: block;
  margin-left: auto;
}
</style>
