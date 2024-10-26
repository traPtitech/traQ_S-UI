<template>
  <div>
    <div :class="$style.container">
      <image-upload v-model="stampImage" />
    </div>
    <div :class="$style.buttonContainer">
      <form-button label="キャンセル" type="tertiary" @click="cancel" />
      <form-button
        label="次へ"
        :loading="isChecking"
        @click="checkStampImage"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import { formatResizeError } from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import { imageSize } from '/@/components/Settings/StampTab/imageSize'
import FormButton from '/@/components/UI/FormButton.vue'
import { useModalStore } from '/@/store/ui/modal'
import ImageUpload from '/@/components/Settings/ImageUpload.vue'

const props = defineProps<{
  file: File
}>()
const emit = defineEmits<{
  (e: 'updateFile', file: File): void
}>()

const { popModal } = useModalStore()

const stampImage = ref<File>(props.file)

const useCheckStamp = (stampImage: Ref<File>) => {
  const { addErrorToast } = useToastStore()
  const isChecking = ref(false)

  const checkStampImage = async () => {
    if (!stampImage.value) return
    isChecking.value = true
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
    emit('updateFile', stampImage.value)
    isChecking.value = false
  }

  return { isChecking, checkStampImage }
}

const { isChecking, checkStampImage } = useCheckStamp(stampImage)
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
