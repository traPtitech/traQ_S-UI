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
import imageCompression, { type Options } from 'browser-image-compression'
import { ref, type Ref } from 'vue'
import ImageUpload from '/@/components/Settings/ImageUpload.vue'
import { imageSize } from '/@/components/Settings/StampTab/imageSize'
import FormButton from '/@/components/UI/FormButton.vue'
import { formatResizeError } from '/@/lib/apis'
import { useModalStore } from '/@/store/ui/modal'
import { useToastStore } from '/@/store/ui/toast'

const props = defineProps<{
  file: File
}>()
const emit = defineEmits<{
  (e: 'updateFile', file: File): void
}>()

const { popModal } = useModalStore()

const stampImage = ref<File>(props.file)

const compressStampImage = async () => {
  // jpeg, png, webp, bmp のみが`imageCompression`で圧縮できる
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']
  if (!allowedTypes.includes(stampImage.value.type)) {
    return
  }
  // `POST /stamps`は、swaggerでは1MBまでのpng, jpeg, gifとあるが、
  // 実際にはそれに加えて2560*1600のピクセル数制限があるため、
  // 1MBの制限に加えて`maxWidthOrHeight`の制約が必要になる。
  const compressionOptions: Options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 2000,
    useWebWorker: true
  }
  stampImage.value = await imageCompression(
    stampImage.value,
    compressionOptions
  )
}

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
      await compressStampImage()
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
