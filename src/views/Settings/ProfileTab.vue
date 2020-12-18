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
      <form-input
        v-model="state.displayName"
        :class="$style.form"
        :max-length="32"
      />
    </div>
    <div :class="$style.element">
      <h3>ひとこと</h3>
      <form-text-area
        v-model="state.bio"
        :class="$style.form"
        rows="1"
        :max-length="1000"
      />
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
      <form-input
        v-model="state.twitterId"
        prefix="@"
        :class="$style.form"
        :max-length="15"
      />
    </div>
    <div :class="$style.updater">
      <form-button
        label="更新"
        :disabled="!canUpdate"
        :loading="isUpdating"
        @click="onUpdateClick"
      />
    </div>
    <password :class="$style.element" />
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, Ref, ref, toRef } from 'vue'
import _store from '@/_store'
import store from '@/store'
import { UserDetail } from '@traptitech/traq'
import apis from '@/lib/apis'
import useStateDiff from '@/components/Settings/use/stateDiff'
import UserIcon from '@/components/UI/UserIcon.vue'
import ImageUpload from '@/components/Settings/ImageUpload.vue'
import useImageUpload, {
  ImageUploadState
} from '@/components/Settings/use/imageUpload'
import FormInput from '@/components/UI/FormInput.vue'
import FormSelector from '@/components/UI/FormSelector.vue'
import FormButton from '@/components/UI/FormButton.vue'
import { nullUuid } from '@/lib/util/uuid'
import Password from '@/components/Settings/ProfileTab/Password.vue'
import useChannelOptions from '@/use/channelOptions'
import FormTextArea from '@/components/UI/FormTextArea.vue'
import useMaxLength from '@/use/maxLength'
import { isValidTwitter } from '@/lib/validate'

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

      _store.commit.ui.toast.addToast({
        type: 'success',
        text: 'プロフィールを更新しました'
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('プロフィールの更新に失敗しました', e)

      _store.commit.ui.toast.addToast({
        type: 'error',
        text: 'プロフィールの更新に失敗しました'
      })
    }
    isUpdating.value = false
  }
  return { isUpdating, onUpdateClick }
}

const useIsLengthValid = (state: Profile) => {
  const { isExceeded: isDisplayNameExceeded } = useMaxLength(
    reactive({ val: toRef(state, 'displayName'), maxLength: 32 })
  )
  const { isExceeded: isBioExceeded } = useMaxLength(
    reactive({ val: toRef(state, 'bio'), maxLength: 1000 })
  )
  const isLengthValid = computed(
    () => !isDisplayNameExceeded.value && !isBioExceeded.value
  )
  return isLengthValid
}

export default defineComponent({
  name: 'ProfileTab',
  setup() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const detail = computed(() => _store.state.domain.me.detail!)

    // ホームチャンネルの選択に必要
    store.dispatch.entities.fetchChannels()

    const { channelOptions } = useChannelOptions('--未設定--')

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
    const isLengthValid = useIsLengthValid(state)
    const isTwitterIdValid = computed(
      () => state.twitterId === '' || isValidTwitter(state.twitterId)
    )

    const canUpdate = computed(
      () => isChanged.value && isLengthValid.value && isTwitterIdValid.value
    )

    return {
      detail,
      channelOptions,
      state,
      imageUploadState,
      onNewImgSet,
      onNewDestroyed,
      canUpdate,
      isUpdating,
      onUpdateClick
    }
  },
  components: {
    UserIcon,
    ImageUpload,
    FormInput,
    FormSelector,
    FormButton,
    Password,
    FormTextArea
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
