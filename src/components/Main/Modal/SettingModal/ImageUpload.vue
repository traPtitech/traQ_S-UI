<template>
  <div>
    <button @click="addImage">ファイルを選択</button>
    <div v-if="image.url !== ''">
      <div :class="$style.cropper">
        <img :src="image.url" ref="$img" />
      </div>
      <p>{{ cropperNote }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watchEffect,
  SetupContext
} from '@vue/composition-api'
import store from '@/store'
import { UserDetail } from '@traptitech/traq'
import apis from '@/lib/api'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import UserIcon from '@/components/UI/UserIcon.vue'
import useImageUpload from './use/imageUpload'

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
  setup(_, context: SetupContext) {
    const { image, addImage } = useImageUpload()

    let cropper: Cropper | undefined
    const $img = ref<HTMLImageElement>()
    const cropperNote = ref('')

    watchEffect(() => {
      if (!image.data || !$img.value) return

      const isGif = image.data.type === 'image/gif'
      const options = isGif
        ? cropperGifOptions
        : {
            ...cropperDefaultOptions,
            cropend: () => {
              cropper?.getCroppedCanvas().toBlob((blob: Blob | null) => {
                context.emit('input', blob)
              }, image.data!.type)
            }
          }

      cropperNote.value = isGif
        ? 'GIFは切り抜きできません'
        : '画像の位置・サイズを編集できます'

      if (cropper) cropper.destroy()
      cropper = new Cropper($img.value, options)
      cropper.replace(image.url)
    })

    return { $img, image, addImage, cropperNote }
  },
  components: {}
})
</script>

<style lang="scss" module>
.cropper {
  width: 400px;
  height: 400px;
}
</style>
