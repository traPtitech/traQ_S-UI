<template>
  <section>
    <div :class="$style.element">
      <h3>アイコン</h3>
      <user-icon
        :user-id="detail.id"
        :size="100"
        :prevent-modal="true"
        :class="$style.icon"
      />
      <image-upload
        @input="onNewImgSet"
        :destroy-flag="imageUploadState.destroyFlag"
        @destroyed="onNewDestroyed"
        rounded
        :class="$style.uploder"
      />
    </div>
    <div :class="$style.element">
      <h3>表示名</h3>
      <form-input v-model="state.displayName" :class="$style.form" />
    </div>
    <div :class="$style.element">
      <h3>ひとこと</h3>
      <form-input v-model="state.bio" :class="$style.form" />
    </div>
    <div :class="$style.element">
      <h3>ホームチャンネル</h3>
      <form-selector
        v-model="state.homeChannel"
        :options="channelOptions"
        :class="$style.form"
      />
    </div>
    <div :class="$style.element">
      <h3>Twitter</h3>
      <form-input v-model="state.twitterId" prefix="@" :class="$style.form" />
    </div>
    <p v-if="showChangeLink">
      パスワードの変更は
      <a :href="changeLink" target="_blank">{{ changeName }}</a>
      から可能です
    </p>
    <div :class="$style.updater">
      <form-button
        label="更新"
        :disabled="!isChanged"
        :loading="isUpdating"
        @click="onUpdateClick"
      />
    </div>
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
import apis from '@/lib/apis'
import useStateDiff from '../use/stateDiff'
import UserIcon from '@/components/UI/UserIcon.vue'
import ImageUpload from '../ImageUpload.vue'
import useImageUpload, { ImageUploadState } from '../use/imageUpload'
import useChannelPath from '@/use/channelPath'
import FormInput from '@/components/UI/FormInput.vue'
import FormSelector from '@/components/UI/FormSelector.vue'
import FormButton from '@/components/UI/FormButton.vue'
import { nullUuid } from '@/lib/util/uuid'
import { compareStringInsensitive } from '@/lib/util/string'
import config from '@/config'

const useChannelOptions = () => {
  const { channelIdToPathString } = useChannelPath()
  return computed(() =>
    [
      {
        key: '--未設定--',
        value: nullUuid
      }
    ].concat(
      Object.values(store.state.entities.channels)
        .map(channel => ({
          key: channelIdToPathString(channel.id, true),
          value: channel.id
        }))
        .sort((a, b) => compareStringInsensitive(a.key, b.key))
    )
  )
}

const useState = (detail: Ref<UserDetail>) => {
  const profile = computed(() => ({
    displayName: detail.value.displayName,
    bio: detail.value.bio,
    twitterId: detail.value.twitterId,
    homeChannel: detail.value.homeChannel ?? nullUuid
  }))
  const state = reactive({ ...profile.value })

  const { hasDiff } = useStateDiff<UserDetail>()
  const isStateChanged = computed(() => hasDiff(state, detail))

  return { state, isStateChanged }
}

type Profile = Pick<
  UserDetail,
  'displayName' | 'bio' | 'twitterId' | 'homeChannel'
> & { homeChannel: string }

const useProfileUpdate = (
  state: Profile,
  imageUploadState: ImageUploadState,
  isStateChanged: Ref<boolean>,
  destroyImageUploadState: () => void
) => {
  const isUpdating = ref(false)

  const onUpdateClick = async () => {
    const promises = []
    if (imageUploadState.imgData !== undefined) {
      promises.push(apis.changeMyIcon(imageUploadState.imgData))
    }
    if (isStateChanged.value) {
      promises.push(apis.editMe(state))
    }
    try {
      isUpdating.value = true
      await Promise.all(promises)
      destroyImageUploadState()

      store.commit.ui.toast.addToast({
        type: 'success',
        text: 'プロフィールを更新しました'
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('プロフィールの更新に失敗しました', e)

      store.commit.ui.toast.addToast({
        type: 'error',
        text: 'プロフィールの更新に失敗しました'
      })
    }
    isUpdating.value = false
  }
  return { isUpdating, onUpdateClick }
}

export default defineComponent({
  name: 'ProfileTab',
  setup() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const detail = computed(() => store.state.domain.me.detail!)

    const channelOptions = useChannelOptions()

    const {
      imageUploadState,
      destroyImageUploadState,
      onNewImgSet,
      onNewDestroyed
    } = useImageUpload()
    const { state, isStateChanged } = useState(detail)
    const isChanged = computed(
      () => isStateChanged.value || imageUploadState.imgData !== undefined
    )

    const { isUpdating, onUpdateClick } = useProfileUpdate(
      state,
      imageUploadState,
      isChanged,
      destroyImageUploadState
    )

    const { changeLink, changeName } = config.auth
    const showChangeLink = changeLink !== undefined && changeName !== undefined

    return {
      detail,
      channelOptions,
      state,
      imageUploadState,
      onNewImgSet,
      onNewDestroyed,
      isChanged,
      isUpdating,
      changeLink,
      changeName,
      showChangeLink,
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

<style lang="scss" module>
.element {
  margin: 24px 0;
}
h3 {
  margin-bottom: 8px;
}
.form {
  margin-left: 12px;
}
.icon {
  margin: {
    bottom: 8px;
    left: 36px;
  }
}
.uploder {
  margin-left: 12px;
}
.updater {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
