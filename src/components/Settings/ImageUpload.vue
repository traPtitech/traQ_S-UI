<template>
  <div>
    <form-button label="ファイルを選択" @click="selectImage" />
    <div v-if="originalImgUrl">
      <div :class="$style.cropper" :data-is-rounded="$boolAttr(rounded)">
        <img ref="imgEle" :src="originalImgUrl" />
      </div>
      <p :class="$style.note">{{ cropperNote }}</p>
      <form-button label="キャンセル" @click="cancel" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, shallowRef, onUnmounted } from 'vue'
import Cropper from 'cropperjs'
import FormButton from '/@/components/UI/FormButton.vue'
import 'cropperjs/dist/cropper.css'
import useObjectURL from '/@/composables/dom/useObjectURL'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'
import { useFileSelect } from '/@/composables/dom/useFileSelect'

const props = withDefaults(
  defineProps<{
    modelValue: File | undefined
    rounded?: boolean
  }>(),
  {
    rounded: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', _file: File | undefined): void
}>()

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
const acceptImageType = ['image/jpeg', 'image/png', 'image/gif'].join(',')

const value = useModelValueSyncer(props, emit)

const originalImg = ref<File | undefined>()
const { selectImage } = useFileSelect({ accept: acceptImageType }, files => {
  originalImg.value = files[0]
})
const originalImgUrl = useObjectURL(originalImg)

let cropper: Cropper | undefined
const imgEle = shallowRef<HTMLImageElement>()
const cropperNote = ref('')

const updateImgView = () => {
  if (!originalImg.value) {
    if (cropper) cropper.destroy()
    return
  }
  emit('update:modelValue', originalImg.value)

  if (!imgEle.value) return

  const isGif = originalImg.value.type === 'image/gif'
  const options = isGif
    ? cropperGifOptions
    : {
        ...cropperDefaultOptions,
        cropend: () => {
          cropper?.getCroppedCanvas().toBlob((blob: Blob | null) => {
            if (!blob) return

            emit(
              'update:modelValue',
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              new File([blob], originalImg.value!.name, { type: blob.type })
            )
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          }, originalImg.value!.type)
        },
        ready: () => {
          cropper?.getCroppedCanvas().toBlob((blob: Blob | null) => {
            if (!blob) return

            emit(
              'update:modelValue',
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              new File([blob], originalImg.value!.name, { type: blob.type })
            )
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          }, originalImg.value!.type)
        }
      }

  cropperNote.value = isGif
    ? 'GIFは切り抜きできません'
    : '画像の位置・サイズを編集できます'

  if (cropper) cropper.destroy()
  cropper = new Cropper(imgEle.value, options)
  cropper.replace(originalImgUrl.value ?? '')
}

watchEffect(updateImgView)

watchEffect(() => {
  if (!value.value) {
    originalImg.value = undefined
  }
})

const cancel = () => {
  emit('update:modelValue', undefined)
}

onUnmounted(() => {
  if (cropper) cropper.destroy()
})
</script>

<style lang="scss" module>
.cropper {
  width: 400px;
  height: 400px;
  margin: 12px;
  &[data-is-rounded] {
    :global(.cropper-view-box),
    :global(.cropper-face) {
      border-radius: 50%;
    }
  }
}
.note {
  margin: 12px;
}
</style>
