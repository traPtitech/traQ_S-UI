<template>
  <section>
    <div :class="$style.element">
      <h3 :class="$style.header">アイコン</h3>
      <user-icon
        :user-id="detail.id"
        :size="100"
        prevent-modal
        :class="$style.icon"
      />
      <image-upload
        :destroy-flag="imageUploadState.destroyFlag"
        rounded
        :class="$style.uploder"
        @input="onNewImgSet"
        @destroyed="onNewDestroyed"
      />
    </div>
    <div :class="$style.element">
      <h3 :class="$style.header">表示名</h3>
      <form-input
        v-model="state.displayName"
        :class="$style.form"
        :max-length="32"
      />
    </div>
    <div :class="$style.element">
      <h3 :class="$style.header">ひとこと</h3>
      <div :class="$style.bioContainer">
        <form-text-area
          v-model="state.bio"
          :class="$style.form"
          rows="1"
          :max-length="1000"
        />
        <div :class="$style.form">
          <h4>プレビュー</h4>
          <inline-markdown :content="state.bio" accept-action />
        </div>
      </div>
    </div>
    <div :class="$style.element">
      <h3 :class="$style.header">ホームチャンネル</h3>
      <form-selector
        v-model="state.homeChannel"
        :options="channelOptions"
        :class="$style.form"
      />
    </div>
    <div :class="$style.element">
      <h3 :class="$style.header">Twitter</h3>
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
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, Ref, ref, toRef } from 'vue'
import { UserDetail } from '@traptitech/traq'
import apis, { formatResizeError } from '/@/lib/apis'
import useStateDiff from '/@/components/Settings/use/stateDiff'
import UserIcon from '/@/components/UI/UserIcon.vue'
import ImageUpload from '/@/components/Settings/ImageUpload.vue'
import useImageUpload, {
  ImageUploadState
} from '/@/components/Settings/use/imageUpload'
import FormInput from '/@/components/UI/FormInput.vue'
import FormSelector from '/@/components/UI/FormSelector.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { nullUuid } from '/@/lib/basic/uuid'
import useChannelOptions from '/@/use/channelOptions'
import FormTextArea from '/@/components/UI/FormTextArea.vue'
import useMaxLength from '/@/use/maxLength'
import { isValidTwitter } from '/@/lib/validate'
import useToastStore from '/@/providers/toastStore'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '/@/store/entities/users'
import { useStampsStore } from '/@/store/entities/stamps'
import { useGroupsStore } from '/@/store/entities/groups'

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
  const { addSuccessToast, addErrorToast } = useToastStore()
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

      addSuccessToast('プロフィールを更新しました')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('プロフィールの更新に失敗しました', e)

      addErrorToast(formatResizeError(e, 'プロフィールの更新に失敗しました'))
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
  components: {
    UserIcon,
    ImageUpload,
    InlineMarkdown,
    FormInput,
    FormSelector,
    FormButton,
    FormTextArea
  },
  setup() {
    const { detail: detailMayBeUndefined } = useMeStore()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const detail = computed(() => detailMayBeUndefined.value!)

    // ホームチャンネルの選択+ひとことのレンダリングに必要
    const { fetchChannels } = useChannelsStore()
    fetchChannels()
    // ひとことのレンダリングに必要
    const { fetchUsers } = useUsersStore()
    fetchUsers()
    const { fetchUserGroups } = useGroupsStore()
    fetchUserGroups()
    const { fetchStamps } = useStampsStore()
    fetchStamps()

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
  }
})
</script>

<style lang="scss" module>
.element {
  margin: 24px 0;
}
.header {
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
.bioContainer {
  display: flex;
  flex-wrap: wrap;
  > * {
    width: 50%;
    flex: 1 1 15rem;
  }
}
.updater {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
