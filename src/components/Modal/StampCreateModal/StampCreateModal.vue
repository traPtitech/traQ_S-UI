<template>
  <modal-frame title="新規スタンプ登録" icon-name="">
    <div :class="$style.container">
      <image-upload v-model="stampImage" :class="$style.form" />
      <div :class="$style.rightContainer">
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
    <p :class="$style.note">{{ cropperNote }}</p>
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
import { imageSize } from '/@/components/Settings/StampTab/imageSize'
import ImageUpload from '/@/components/Settings/ImageUpload.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import ModalFrame from '../Common/ModalFrame.vue'
import { useMeStore } from '/@/store/domain/me'
import { useModalStore } from '/@/store/ui/modal'

const props = defineProps<{
  file: File
}>()

const { detail } = useMeStore()
const { clearModal } = useModalStore()

const stampImage = ref(props.file)
const newStampName = ref('')
const isCreateEnabled = computed(() => isValidStampName(newStampName.value))
watch(
  () => stampImage.value,
  newImageData => {
    if (!newStampName.value && newImageData && newImageData.name) {
      newStampName.value = trimExt(newImageData.name)
    }
  }
)

const isGif = stampImage.value.type === 'image/gif'
const cropperNote = computed(() =>
  isGif ? 'GIFは切り抜きできません' : '画像の位置・サイズを編集できます'
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
      const size = await imageSize(stampImage.value)
      if (size.height !== size.width) {
        addErrorToast('画像が正方形ではありません。編集してください')
        return
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('スタンプの作成に失敗しました', e)
      addErrorToast(formatResizeError(e, 'スタンプの作成に失敗しました'))
    }
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
</script>

<style lang="scss" module>
.subtitle {
  a {
    pointer-events: none;
  }
}
.item {
  margin: 16px 0;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.form {
  margin: 8px 0;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.rightContainer {
  width: 100%;
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
  margin-left: 12px;
  margin-bottom: 12px;
}
.buttonContainer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}
</style>
