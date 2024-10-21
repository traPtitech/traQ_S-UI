<template>
  <div>
    <section :class="$style.section">
      <h3 :class="$style.heading">アイコン</h3>
      <div :class="$style.iconContainer">
        <user-icon :user-id="detail.id" :size="200" prevent-modal />
        <form-button
          label="アイコンを変更する"
          type="secondary"
          :class="$style.iconEditButton"
          @click="handleOpenModal"
        />
      </div>
    </section>
    <section :class="$style.section">
      <h3 :class="$style.heading">表示名</h3>
      <form-input v-model="state.displayName" :max-length="32" />
    </section>
    <section :class="$style.section">
      <h3 :class="$style.heading">ひとこと</h3>
      <div :class="$style.bioContainer">
        <inline-markdown :content="state.bio" accept-action />
        <form-text-area v-model="state.bio" rows="2" :max-length="1000" />
      </div>
    </section>
    <section :class="$style.section">
      <h3 :class="$style.heading">ホームチャンネル</h3>
      <form-selector-filterable
        v-model="state.homeChannel"
        :options="channelOptions"
      />
    </section>
    <section :class="$style.section">
      <h3 :class="$style.heading">X (旧Twitter)</h3>
      <form-input v-model="state.twitterId" prefix="@" :max-length="15" />
    </section>
    <div :class="$style.buttonContainer">
      <form-button
        label="リセット"
        :disabled="!isChanged"
        type="tertiary"
        @click="handleReset"
      />
      <form-button
        label="プロフィールを更新"
        :disabled="!canUpdate"
        :loading="isUpdating"
        @click="handleUpdate"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { Ref } from 'vue'
import { computed, reactive, ref, toRef } from 'vue'
import type { UserDetail } from '@traptitech/traq'
import apis, { formatResizeError } from '/@/lib/apis'
import useStateDiff from '/@/components/Settings/composables/useStateDiff'
import { nullUuid } from '/@/lib/basic/uuid'
import useChannelOptions from '/@/composables/useChannelOptions'
import useMaxLength from '/@/composables/utils/useMaxLength'
import { isValidTwitter } from '/@/lib/validate'
import { useToastStore } from '/@/store/ui/toast'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '/@/store/entities/users'
import { useStampsStore } from '/@/store/entities/stamps'
import { useGroupsStore } from '/@/store/entities/groups'
import FormButton from '/@/components/UI/FormButton.vue'
import { useFileSelect } from '/@/composables/dom/useFileSelect'
import { useModalStore } from '/@/store/ui/modal'
import { onBeforeRouteLeave } from 'vue-router'

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

  const handleReset = () => {
    if (!confirm('変更をリセットしますか？')) return
    Object.assign(state, profile.value)
  }

  return { state, isStateChanged, handleReset }
}

type Profile = Pick<
  UserDetail,
  'displayName' | 'bio' | 'twitterId' | 'homeChannel'
> & { homeChannel: string }

const useProfileUpdate = (state: Profile) => {
  const { addSuccessToast, addErrorToast } = useToastStore()
  const isUpdating = ref(false)

  const handleUpdate = async () => {
    try {
      isUpdating.value = true
      await apis.editMe(state)

      addSuccessToast('プロフィールを更新しました')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('プロフィールの更新に失敗しました', e)

      addErrorToast(formatResizeError(e, 'プロフィールの更新に失敗しました'))
    }
    isUpdating.value = false
  }
  return { isUpdating, handleUpdate }
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
</script>

<script lang="ts" setup>
import UserIcon from '/@/components/UI/UserIcon.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import FormSelectorFilterable from '/@/components/UI/FormSelectorFilterable.vue'
import FormTextArea from '/@/components/UI/FormTextArea.vue'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'

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

const { state, isStateChanged, handleReset } = useState(detail)

const isChanged = computed(() => isStateChanged.value)

const { isUpdating, handleUpdate } = useProfileUpdate(state)
const isLengthValid = useIsLengthValid(state)
const isTwitterIdValid = computed(
  () => state.twitterId === '' || isValidTwitter(state.twitterId)
)

const canUpdate = computed(
  () => isChanged.value && isLengthValid.value && isTwitterIdValid.value
)

const { pushModal } = useModalStore()

const acceptImageType = ['image/jpeg', 'image/png', 'image/gif'].join(',')
const { selectImage } = useFileSelect({ accept: acceptImageType }, files => {
  if (!files[0]) return
  pushModal({
    type: 'settings-profile-icon-edit',
    file: files[0]
  })
})
const handleOpenModal = () => {
  selectImage()
}

onBeforeRouteLeave(() => {
  if (!isChanged.value) return
  const result = window.confirm(
    'このページを離れると変更が破棄されます。本当に離れますか？'
  )
  if (!result) {
    return false
  }
})
</script>

<style lang="scss" module>
.section {
  margin: 32px 0;
}
.heading {
  margin-bottom: 4px;
}
.iconContainer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.iconEditButton {
  margin-top: 8px;
}
.bioContainer {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.buttonContainer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}
</style>
