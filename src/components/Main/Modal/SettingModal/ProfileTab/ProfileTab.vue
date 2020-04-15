<template>
  <section>
    <div>
      <h3>アイコン</h3>
      <user-icon :user-id="detail.id" :size="100" :prevent-modal="true" />
      <image-upload
        @input="onNewImgSet"
        :destroy-flag="imageUploadState.destroyFlag"
        @destroyed="onNewDestroyed"
        rounded
      />
    </div>
    <div>
      <h3>表示名</h3>
      <form-input v-model="state.displayName" />
    </div>
    <div>
      <h3>ひとこと</h3>
      <form-input v-model="state.bio" />
    </div>
    <div>
      <h3>ホームチャンネル</h3>
      <form-selector v-model="homeChannelState" :options="channelOptions" />
    </div>
    <div>
      <h3>Twitter</h3>
      <form-input v-model="state.twitterId" prefix="@" />
    </div>
    <p>
      パスワードの変更は
      <a href="https://portal.trap.jp/" target="_blank">
        traPortal
      </a>
      から可能です
    </p>
    <form-button v-if="isChanged" label="更新" @click="onUpdateClick" />
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  Ref,
  ref
} from '@vue/composition-api'
import store from '@/store'
import { UserDetail } from '@traptitech/traq'
import apis from '@/lib/api'
import useStateDiff from '../use/stateDiff'
import UserIcon from '@/components/UI/UserIcon.vue'
import ImageUpload from '../ImageUpload.vue'
import useImageUpload from '../use/imageUpload'
import useChannelPath from '@/use/channelPath'
import FormInput from '@/components/UI/FormInput.vue'
import FormSelector from '@/components/UI/FormSelector.vue'
import FormButton from '@/components/UI/FormButton.vue'

const useChannelOptions = () => {
  const { channelIdToPath } = useChannelPath()
  return computed(() =>
    [
      {
        key: '--未設定--',
        value: '00000000-0000-0000-0000-000000000000'
      }
    ].concat(
      Object.values(store.state.entities.channels)
        .map(channel => ({
          key: `#${channelIdToPath(channel.id).join('/')}`,
          value: channel.id
        }))
        .sort((a, b) => (a.key > b.key ? 1 : -1))
    )
  )
}

const useState = (detail: Ref<UserDetail>) => {
  const state = reactive({
    displayName: detail.value.displayName,
    bio: detail.value.bio,
    twitterId: detail.value.twitterId
  })
  const homeChannelState = ref(
    detail.value.homeChannel ?? '00000000-0000-0000-0000-000000000000'
  )
  const isHomeChannelChanged = computed(
    () =>
      homeChannelState.value !== detail.value.homeChannel &&
      !(
        homeChannelState.value === '00000000-0000-0000-0000-000000000000' &&
        detail.value.homeChannel === null
      )
  )

  const { hasDiff } = useStateDiff<UserDetail>()
  const isStateChanged = computed(
    () => hasDiff(state, detail) || isHomeChannelChanged.value
  )

  return { state, homeChannelState, isStateChanged }
}

export default defineComponent({
  name: 'ProfileTab',
  setup() {
    const detail = computed(() => store.state.domain.me.detail!)

    const channelOptions = useChannelOptions()

    const {
      imageUploadState,
      destroyImageUploadState,
      onNewImgSet,
      onNewDestroyed
    } = useImageUpload()

    const { state, homeChannelState, isStateChanged } = useState(detail)

    const isChanged = computed(
      () => isStateChanged.value || imageUploadState.imgData !== undefined
    )
    const onUpdateClick = async () => {
      const promises = []
      if (imageUploadState.imgData !== undefined) {
        promises.push(
          apis.changeUserIcon(detail.value.id, imageUploadState.imgData)
        )
      }
      if (isStateChanged.value) {
        promises.push(
          apis.editMe({
            ...state,
            homeChannel: homeChannelState.value
          })
        )
      }
      try {
        // TODO: loading
        await Promise.all(promises)
        destroyImageUploadState()
      } catch (e) {
        // TODO: error
      }
    }

    return {
      detail,
      channelOptions,
      state,
      homeChannelState,
      imageUploadState,
      onNewImgSet,
      onNewDestroyed,
      isChanged,
      onUpdateClick
    }
  },
  components: {
    UserIcon,
    ImageUpload,
    FormInput,
    FormSelector,
    FormButton
  }
})
</script>

<style lang="scss" module></style>
