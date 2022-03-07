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
import { defineComponent, computed, reactive, watch, toRef } from 'vue'
import store from '/@/vuex'
import useChannelPath from '/@/use/channelPath'
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { rootChannelId } from '/@/lib/channelTree'
import { ChannelId } from '/@/types/entity-ids'
import useChannelOptions from '/@/use/channelOptions'
import FormSelector from '/@/components/UI/FormSelector.vue'
import { UserPermission } from '@traptitech/traq'
import useCanCreateChildChannel from '/@/use/canCreateChildChannel'
import { isValidChannelName } from '/@/lib/validate'
import apis from '/@/lib/apis'
import { channelTreeMitt } from '/@/vuex/domain/channelTree'
import useToastStore from '/@/providers/toastStore'
import { constructChannelPath } from '/@/router'
import { useRouter } from 'vue-router'

interface State {
  channelName: string
  parentChannelId: ChannelId | null
}

const useCreateChannel = (state: State) => {
  const router = useRouter()
  const { addErrorToast } = useToastStore()

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
      await store.dispatch.entities.addChannel({ channelId: channel.id })
      const path = await pathObtainPromise

      await store.dispatch.ui.modal.popModal()
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
  const hasChannelEditPermission = computed(() =>
    store.state.domain.me.detail?.permissions.includes(
      UserPermission.EditChannel
    )
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
      () =>
        isValidChannelName(state.channelName) && state.parentChannelId !== null
    )

    return {
      state,
      channelOptions,
      createChannel,
      title,
      subtitle,
      newChannelPath,
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
