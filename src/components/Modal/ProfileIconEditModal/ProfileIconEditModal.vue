<template>
  <modal-frame
    title="アイコンの編集"
    subtitle="画像の位置・サイズを編集できます"
  >
    <div :class="$style.container">
      <image-upload v-model="iconImage" />
    </div>
    <div :class="$style.buttonContainer">
      <form-button label="キャンセル" type="tertiary" @click="cancel" />
      <form-button
        label="更新する"
        :loading="isEditing"
        @click="editIconImage"
      />
    </div>
  </modal-frame>
</template>

<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import apis, { formatResizeError } from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import FormButton from '/@/components/UI/FormButton.vue'
import ModalFrame from '../Common/ModalFrame.vue'
import { useModalStore } from '/@/store/ui/modal'
import ImageUpload from '/@/components/Settings/ImageUpload.vue'

const props = defineProps<{
  file: File
}>()

const { clearModal } = useModalStore()

const iconImage = ref<File>(props.file)

const useIconImageEdit = (iconImage: Ref<File>) => {
  const { addSuccessToast, addErrorToast } = useToastStore()
  const isEditing = ref(false)

  const editIconImage = async () => {
    if (!iconImage.value) return
    isEditing.value = true
    try {
      await apis.changeMyIcon(iconImage.value)

      addSuccessToast('アイコン画像を変更しました')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('アイコン画像の変更に失敗しました', e)
      addErrorToast(formatResizeError(e, 'アイコン画像の変更に失敗しました'))
    }
    clearModal()
    isEditing.value = false
  }

  return { isEditing, editIconImage }
}

const { isEditing, editIconImage } = useIconImageEdit(iconImage)
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
