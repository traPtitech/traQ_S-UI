<template>
  <div>
    <form-button label="ファイルを選択" @click="addImage" />
    <div v-if="image.url !== ''">
      <div :class="$style.cropper" :data-is-rounded="$boolAttr(rounded)">
        <img ref="imgEle" :src="image.url" />
      </div>
      <p :class="$style.note">{{ cropperNote }}</p>
      <form-button label="キャンセル" @click="destroy" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watchEffect,
  SetupContext,
  shallowRef
} from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import FormButton from '/@/components/UI/FormButton.vue'
import { useImageUploadInternal } from './use/imageUpload'

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

// スタンプ編集用の設定
const cropperDefaultOptions = {
  viewMode: 3,
  aspectRatio: 1,
  autoCropArea: 1,
  dragMode: 'move' as const
} as const

export default defineComponent({
  name: 'ImageUpload',
  components: {
    FormButton
  },
  props: {
    rounded: {
      type: Boolean,
      default: false
    },
    destroyFlag: {
      type: Boolean,
      required: true
    }
  },
  setup(prop, context: SetupContext) {
    const {
      image,
      addImage,
      destroy: destroyImage
    } = useImageUploadInternal(() => {
      // 画像選択したあとcropperの操作をしなかった場合変更を検知しないため
      context.emit('input', image.data)
    })

    let cropper: Cropper | undefined
    const imgEle = shallowRef<HTMLImageElement>()
    const cropperNote = ref('')

    watchEffect(() => {
      if (!image.data || !imgEle.value) return

      const isGif = image.data.type === 'image/gif'
      const options = isGif
        ? cropperGifOptions
        : {
            ...cropperDefaultOptions,
            cropend: () => {
              cropper?.getCroppedCanvas().toBlob((blob: Blob | null) => {
                context.emit('input', blob)
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              }, image.data!.type)
            }
          }

      cropperNote.value = isGif
        ? 'GIFは切り抜きできません'
        : '画像の位置・サイズを編集できます'

      if (cropper) cropper.destroy()
      cropper = new Cropper(imgEle.value, options)
      cropper.replace(image.url)
    })

    const destroy = () => {
      destroyImage()
      if (cropper) cropper.destroy()
    }

    watchEffect(() => {
      if (prop.destroyFlag) {
        destroy()
        context.emit('destroyed')
      }
    })

    return { imgEle, image, addImage, cropperNote, destroy }
  }
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
