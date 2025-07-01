<template>
  <modal-frame
    title="スタンプ画像の編集"
    subtitle="画像の位置・サイズを編集できます"
  >
    <div :class="$style.container">
      <image-upload v-model="stampImage" />
    </div>
    <div :class="$style.buttonContainer">
      <form-button label="キャンセル" type="tertiary" @click="cancel" />
      <form-button
        label="更新する"
        :loading="isEditing"
        @click="editStampImage"
      />
    </div>
  </modal-frame>
</template>

<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import apis, { formatResizeError } from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import { imageSize } from '/@/components/Settings/StampTab/imageSize'
import FormButton from '/@/components/UI/FormButton.vue'
import ModalFrame from '../Common/ModalFrame.vue'
import { useModalStore } from '/@/store/ui/modal'
import ImageUpload from '/@/components/Settings/ImageUpload.vue'
import type { StampId } from '/@/types/entity-ids'

const props = defineProps<{
  file: File
  id: StampId
}>()

const { clearModal } = useModalStore()

const stampImage = ref<File>(props.file)

const useStampImageEdit = (stampImage: Ref<File>) => {
  const { addSuccessToast, addErrorToast } = useToastStore()
  const isEditing = ref(false)

  const editStampImage = async () => {
    if (!stampImage.value) return
    isEditing.value = true
    try {
      const size = await imageSize(stampImage.value)
      if (size.height !== size.width) {
        addErrorToast('画像が正方形ではありません。編集してください')
        return
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('画像の整形に失敗しました', e)
      addErrorToast(formatResizeError(e, '画像の整形に失敗しました'))
    }
    try {
      await apis.changeStampImage(props.id, stampImage.value)

      addSuccessToast('スタンプ画像を変更しました')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('スタンプ画像の変更に失敗しました', e)
      addErrorToast(formatResizeError(e, 'スタンプ画像の変更に失敗しました'))
    }
    clearModal()
    isEditing.value = false
  }

  return { isEditing, editStampImage }
}

const { isEditing, editStampImage } = useStampImageEdit(stampImage)
const cancel = () => {
  clearModal()
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  justify-content: center;
}

.buttonContainer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
}
</style>
