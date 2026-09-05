<template>
  <cropper-canvas
    v-if="originalImgUrl"
    ref="cropperCanvasRef"
    :data-is-rounded="$boolAttr(rounded)"
    :class="$style.cropper"
    background
    @actionend="apply"
  >
    <cropper-image
      ref="cropperImageRef"
      :src="originalImgUrl"
      initial-fit="cover"
      min-fit="cover"
      rotatable
      scalable
      translatable
      @change="onCropperImageChange"
      @transform="clampImageTransform"
    />
    <cropper-shade />
    <cropper-handle :action="dragMode" plain />

    <cropper-selection
      ref="cropperSelectionRef"
      aspect-ratio="1"
      initial-aspect-ratio="1"
      initial-coverage="1"
      :movable="cropBoxMovable"
      :resizable="cropBoxResizable"
      outlined
      theme-color="rgba(51, 153, 255, 0.75)"
      @change="onCropperSelectionChange"
    >
      <cropper-grid role="grid" covered />
      <cropper-crosshair centered />

      <cropper-handle
        action="move"
        theme-color="rgba(255, 255, 255, 0.35)"
        @dblclick="toggleActionOnDblclick"
      />
      <cropper-handle
        action="n-resize"
        theme-color="rgba(51, 153, 255, 0.75)"
      />
      <cropper-handle
        action="e-resize"
        theme-color="rgba(51, 153, 255, 0.75)"
      />
      <cropper-handle
        action="s-resize"
        theme-color="rgba(51, 153, 255, 0.75)"
      />
      <cropper-handle
        action="w-resize"
        theme-color="rgba(51, 153, 255, 0.75)"
      />
      <cropper-handle
        action="ne-resize"
        theme-color="rgba(51, 153, 255, 0.75)"
      />
      <cropper-handle
        action="nw-resize"
        theme-color="rgba(51, 153, 255, 0.75)"
      />
      <cropper-handle
        action="se-resize"
        theme-color="rgba(51, 153, 255, 0.75)"
      />
      <cropper-handle
        action="sw-resize"
        theme-color="rgba(51, 153, 255, 0.75)"
      />
    </cropper-selection>
  </cropper-canvas>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, useTemplateRef } from 'vue'

import CropperCanvas from '@cropper/element-canvas'
import CropperCrosshair from '@cropper/element-crosshair'
import CropperGrid from '@cropper/element-grid'
import CropperHandle from '@cropper/element-handle'
import CropperImage from '@cropper/element-image'
import CropperSelection, { type Selection } from '@cropper/element-selection'
import CropperShade from '@cropper/element-shade'

import useObjectURL from '/@/composables/dom/useObjectURL'

CropperCanvas.$define()
CropperImage.$define()
CropperGrid.$define()
CropperCrosshair.$define()
CropperShade.$define()
CropperSelection.$define()
CropperHandle.$define()

const modelValue = defineModel<File>({ required: true })

withDefaults(
  defineProps<{
    rounded?: boolean
  }>(),
  {
    rounded: false
  }
)

const originalImg = ref<File>(modelValue.value)
const originalImgUrl = useObjectURL(originalImg)

const cropperCanvas = useTemplateRef<CropperCanvas>('cropperCanvasRef')
const cropperImage = useTemplateRef<CropperImage>('cropperImageRef')
const cropperSelection = useTemplateRef<CropperSelection>('cropperSelectionRef')

const isGif = computed(() => originalImg.value.type === 'image/gif')

const isSelectionMaximized = ref(true)
let nextImage: Selection | undefined
let isClampingImageTransform = false
const cropBoxMovable = computed(
  () => !isGif.value && !isSelectionMaximized.value
)
const cropBoxResizable = computed(() => !isGif.value)
const dragMode = ref<'move' | 'none' | 'select'>(isGif.value ? 'none' : 'move')

const toggleActionOnDblclick = () => {
  if (isGif.value) return

  dragMode.value = dragMode.value === 'move' ? 'select' : 'move'
}
const inSelection = (selection: Selection, maxSelection: Selection) => {
  return (
    selection.x >= maxSelection.x &&
    selection.y >= maxSelection.y &&
    selection.x + selection.width <= maxSelection.x + maxSelection.width &&
    selection.y + selection.height <= maxSelection.y + maxSelection.height
  )
}

const coversSelection = (image: Selection, selection: Selection) => {
  return (
    image.x <= selection.x &&
    image.y <= selection.y &&
    image.x + image.width >= selection.x + selection.width &&
    image.y + image.height >= selection.y + selection.height
  )
}

const onCropperSelectionChange = (event: CustomEvent) => {
  if (!cropperCanvas.value) {
    return
  }

  const cropperCanvasRect = cropperCanvas.value.getBoundingClientRect()
  const selection = event.detail as Selection
  const maxSelection: Selection = {
    x: 0,
    y: 0,
    width: cropperCanvasRect.width,
    height: cropperCanvasRect.height
  }

  if (!inSelection(selection, maxSelection)) {
    event.preventDefault()
    return
  }

  isSelectionMaximized.value =
    selection.x === 0 &&
    selection.y === 0 &&
    selection.width === maxSelection.width &&
    selection.height === maxSelection.height
}

const onCropperImageChange = (event: CustomEvent) => {
  nextImage = event.detail as Selection
}

const clampImageTransform = (event: CustomEvent) => {
  if (!cropperCanvas.value) {
    return
  }

  if (isClampingImageTransform || !nextImage) {
    return
  }

  const cropperCanvasRect = cropperCanvas.value.getBoundingClientRect()
  const canvas: Selection = {
    x: 0,
    y: 0,
    width: cropperCanvasRect.width,
    height: cropperCanvasRect.height
  }

  if (coversSelection(nextImage, canvas)) {
    return
  }

  const matrix = (event.detail as { matrix: number[] }).matrix
  if (matrix.length !== 6) {
    return
  }

  const [a, b, c, d, e, f] = matrix
  if (
    a === undefined ||
    b === undefined ||
    c === undefined ||
    d === undefined ||
    e === undefined ||
    f === undefined
  ) {
    return
  }

  const x = Math.min(0, Math.max(canvas.width - nextImage.width, nextImage.x))
  const y = Math.min(0, Math.max(canvas.height - nextImage.height, nextImage.y))

  event.preventDefault()
  isClampingImageTransform = true
  cropperImage.value?.$setTransform(
    a,
    b,
    c,
    d,
    e + x - nextImage.x,
    f + y - nextImage.y
  )
  isClampingImageTransform = false
}

const apply = async () => {
  if (isGif.value) return

  const canvas = await cropperSelection.value?.$toCanvas()
  if (!canvas) return

  canvas.toBlob((blob: Blob | null) => {
    if (!blob) return

    modelValue.value = new File([blob], originalImg.value.name, {
      type: blob.type
    })
  }, originalImg.value.type)
}

onMounted(() => {
  cropperImage.value?.$ready(apply)
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

  * {
    // _reset.scss で none になってるので戻す (何に？)
    // initial や revert ではダメで，revert-layer でないと cropper-shade が表示されないが，理由はわからない．
    outline: revert-layer;
  }
}
</style>
