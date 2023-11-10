<template>
  <modal-frame title="新規スタンプ登録" icon-name="">
    <div :class="$style.container">
      <div :class="$style.leftContainer">
        <button :class="$style.imgButton" @click="selectImage">
          <img v-if="imageUrl" :src="imageUrl" width="136" height="136" />
          <a-icon v-else name="plus" mdi />
        </button>
      </div>
      <div>
        <form-input
          v-model="newStampName"
          label="スタンプ名"
          prefix=":"
          suffix=":"
          :max-length="32"
          :class="$style.form"
        />
        <label :class="$style.label">所有者</label>
        <p :class="$style.creator">@ {{ detail?.name }}</p>
      </div>
    </div>
    <p :class="$style.note">{{ note }}</p>
    <div :class="$style.buttonContainer">
      <form-button label="キャンセル" color="secondary" @click="cancel" />
      <form-button
        label="登録する"
        :disabled="!isCreateEnabled"
        :loading="isCreating"
        :class="$style.form"
        @click="createStamp"
      />
    </div>
  </modal-frame>
</template>

<script lang="ts" setup>
import { ref, computed, watch, type Ref } from 'vue'
import apis, { formatResizeError } from '/@/lib/apis'
import { isValidStampName } from '/@/lib/validate'
import { useToastStore } from '/@/store/ui/toast'
import FormInput from '/@/components/UI/FormInput.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import ModalFrame from '../Common/ModalFrame.vue'
import { useMeStore } from '/@/store/domain/me'
import { useModalStore } from '/@/store/ui/modal'
import AIcon from '/@/components/UI/AIcon.vue'
import { useFileSelect } from '/@/composables/dom/useFileSelect'

const { detail } = useMeStore()
const { clearModal, pushModal } = useModalStore()

const stampImage = ref<File>()
const imageUrl = computed(() =>
  stampImage.value ? URL.createObjectURL(stampImage.value) : undefined
)
const newStampName = ref('')

const acceptImageType = ['image/jpeg', 'image/png', 'image/gif'].join(',')

const isCreateEnabled = computed(() => isValidStampName(newStampName.value))
watch(
  () => stampImage.value,
  newImageData => {
    if (!newStampName.value && newImageData && newImageData.name) {
      newStampName.value = trimExt(newImageData.name)
    }
  }
)

const note = computed(() =>
  stampImage.value
    ? '画像をクリックしてアップロード'
    : '＋をクリックしてアップロード'
)

/**
 * 拡張子を削る
 */
const trimExt = (filename: string) => filename.replace(/\.[^.]+$/, '')

const useStampCreate = (
  newStampName: Ref<string>,
  stampImage: Ref<File | undefined>
) => {
  const { addSuccessToast, addErrorToast } = useToastStore()
  const isCreating = ref(false)

  const createStamp = async () => {
    if (!stampImage.value) return
    try {
      isCreating.value = true
      await apis.createStamp(newStampName.value, stampImage.value)
      newStampName.value = ''
      stampImage.value = undefined

      addSuccessToast('スタンプを登録しました')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('スタンプの作成に失敗しました', e)

      addErrorToast(formatResizeError(e, 'スタンプの作成に失敗しました'))
    }
    isCreating.value = false
    clearModal()
  }

  return { isCreating, createStamp }
}

const { isCreating, createStamp } = useStampCreate(newStampName, stampImage)
const cancel = () => {
  clearModal()
}

const { selectImage } = useFileSelect({ accept: acceptImageType }, files => {
  if (!files[0]) return
  pushModal({
    type: 'settings-stamp-image-edit',
    file: files[0]
  })
})
</script>

<style lang="scss" module>
.form {
  margin: 8px 0;
}

.container {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.leftContainer {
  width: 136px;
  height: 136px;
  margin: 8px 0;
  flex-grow: 1;
}
.imgButton {
  width: 100%;
  height: 100%;
  border: 2px solid $theme-ui-secondary-default;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.label {
  @include color-ui-secondary;
  margin-bottom: 16px;
}
.creator {
  @include color-ui-primary;
}
.note {
  @include color-ui-secondary;
  margin-bottom: 12px;
  font-size: 12px;
}
.buttonContainer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}
</style>
