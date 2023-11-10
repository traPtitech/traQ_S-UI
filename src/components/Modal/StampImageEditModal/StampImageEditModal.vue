<template>
  <modal-frame
    title="スタンプ画像の編集"
    subtitle="画像の位置・サイズを編集できます"
    icon-name=""
  >
    <div :class="$style.container">
      <image-upload v-model="stampImage" />
    </div>
    <div :class="$style.buttonContainer">
      <form-button label="キャンセル" color="secondary" @click="cancel" />
      <form-button
        label="更新する"
        :loading="isCreating"
        @click="createStamp"
      />
    </div>
  </modal-frame>
</template>

<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import { formatResizeError } from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import { imageSize } from '/@/components/Settings/StampTab/imageSize'
import FormButton from '/@/components/UI/FormButton.vue'
import ModalFrame from '../Common/ModalFrame.vue'
import { useModalStore } from '/@/store/ui/modal'
import ImageUpload from '/@/components/Settings/ImageUpload.vue'

const props = defineProps<{
  file: File
}>()

const { popModal } = useModalStore()

const stampImage = ref<File>(props.file)

const useStampCreate = (stampImage: Ref<File | undefined>) => {
  const { addErrorToast } = useToastStore()
  const isCreating = ref(false)

  const createStamp = async () => {
    if (!stampImage.value) return
    isCreating.value = true
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
    isCreating.value = false
    popModal()
  }

  return { isCreating, createStamp }
}

const { isCreating, createStamp } = useStampCreate(stampImage)
const cancel = () => {
  popModal()
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
