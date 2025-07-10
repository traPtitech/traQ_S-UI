<template>
  <div
    v-if="originalImgUrl"
    :class="$style.cropper"
    :data-is-rounded="$boolAttr(rounded)"
  >
    <img ref="imgEle" :src="originalImgUrl" />
  </div>
</template>

<script lang="ts" setup>
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { onUnmounted, ref, shallowRef, watchEffect } from 'vue'
import useObjectURL from '/@/composables/dom/useObjectURL'

const modelValue = defineModel<File | undefined>({ required: true })

withDefaults(
  defineProps<{
    rounded?: boolean
  }>(),
  {
    rounded: false
  }
)

// スタンプ編集用の設定
const cropperGifOptions = {
  viewMode: 3,
  aspectRatio: 1,
  autoCropArea: 1,
  dragMode: 'none',
  cropBoxMovable: false,
  cropBoxResizable: false,
  toggleDragModeOnDblclick: false
} as const
const cropperDefaultOptions = {
  viewMode: 3,
  aspectRatio: 1,
  autoCropArea: 1,
  autoCrop: true,
  dragMode: 'move' as const
} as const

const originalImg = ref<File | undefined>(modelValue.value)
const originalImgUrl = useObjectURL(originalImg)

let cropper: Cropper | undefined
const imgEle = shallowRef<HTMLImageElement>()

const updateImgView = () => {
  if (!originalImg.value) {
    if (cropper) cropper.destroy()
    return
  }
  modelValue.value = originalImg.value

  if (!imgEle.value) return

  const isGif = originalImg.value.type === 'image/gif'
  const options = isGif
    ? cropperGifOptions
    : {
        ...cropperDefaultOptions,
        cropend: () => {
          cropper?.getCroppedCanvas().toBlob((blob: Blob | null) => {
            if (!blob) return

            modelValue.value =
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              new File([blob], originalImg.value!.name, { type: blob.type })
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          }, originalImg.value!.type)
        },
        ready: () => {
          cropper?.getCroppedCanvas().toBlob((blob: Blob | null) => {
            if (!blob) return

            modelValue.value =
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              new File([blob], originalImg.value!.name, { type: blob.type })
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          }, originalImg.value!.type)
        }
      }

  if (cropper) cropper.destroy()
  cropper = new Cropper(imgEle.value, options)
  cropper.replace(originalImgUrl.value ?? '')
}

watchEffect(updateImgView)

watchEffect(() => {
  if (!modelValue.value) {
    originalImg.value = undefined
  }
})

onUnmounted(() => {
  if (cropper) cropper.destroy()
})
</script>

<style lang="scss" module>
.cropper {
  width: 280px;
  height: 280px;
  &[data-is-rounded] {
    :global(.cropper-view-box),
    :global(.cropper-face) {
      border-radius: 50%;
    }
  }
}
</style>
