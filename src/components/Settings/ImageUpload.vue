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
      rotatable
      scalable
      skewable
      translatable
      @transform="onCropperImageTransform"
    />
    <cropper-shade />
    <cropper-handle action="move" plain />

    <cropper-selection
      ref="cropperSelectionRef"
      aspect-ratio="1"
      initial-aspect-ratio="1"
      initial-coverage="1"
      :movable="cropBoxMovable"
      :resizable="cropBoxResizable"
      outlined
      @change="onCropperSelectionChange"
    >
      <cropper-grid role="grid" covered />
      <cropper-crosshair centered />

      <cropper-handle
        :action="dragMode"
        theme-color="rgba(255, 255, 255, 0.35)"
        @dblclick="toggleActionOnDblclick"
      />
      <cropper-handle action="n-resize" />
      <cropper-handle action="e-resize" />
      <cropper-handle action="s-resize" />
      <cropper-handle action="w-resize" />
      <cropper-handle action="ne-resize" />
      <cropper-handle action="nw-resize" />
      <cropper-handle action="se-resize" />
      <cropper-handle action="sw-resize" />
    </cropper-selection>
  </cropper-canvas>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import useObjectURL from '/@/composables/dom/useObjectURL'
import CropperCanvas from '@cropper/element-canvas'
import CropperImage from '@cropper/element-image'
import CropperGrid from '@cropper/element-grid'
import CropperCrosshair from '@cropper/element-crosshair'
import CropperShade from '@cropper/element-shade'
import CropperSelection, { type Selection } from '@cropper/element-selection'
import CropperHandle from '@cropper/element-handle'

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

const cropBoxMovable = computed(() => !isGif.value)
const cropBoxResizable = computed(() => !isGif.value)
const dragMode = computed(() => (isGif.value ? 'none' : 'move'))

const toggleActionOnDblclick = (event: MouseEvent) => {
  if (isGif.value) return

  const cropperHandle = event.target as CropperHandle
  cropperHandle.action = cropperHandle.action === 'move' ? 'select' : 'move'
}
const inSelection = (selection: Selection, maxSelection: Selection) => {
  return (
    selection.x >= maxSelection.x &&
    selection.y >= maxSelection.y &&
    selection.x + selection.width <= maxSelection.x + maxSelection.width &&
    selection.y + selection.height <= maxSelection.y + maxSelection.height
  )
}

const onCropperImageTransform = (event: CustomEvent) => {
  if (!cropperCanvas.value || !cropperImage.value) {
    return
  }

  const cropperCanvasRect = cropperCanvas.value.getBoundingClientRect()
  const cropperImageClone = cropperImage.value.cloneNode() as CropperImage
  cropperImageClone.style.transform = `matrix(${event.detail.matrix.join(', ')})`
  cropperImageClone.style.opacity = '0'
  cropperCanvas.value.appendChild(cropperImageClone)
  const cropperImageRect = cropperImageClone.getBoundingClientRect()
  cropperCanvas.value.removeChild(cropperImageClone)

  if (
    cropperImageRect.top > cropperCanvasRect.top ||
    cropperImageRect.right < cropperCanvasRect.right ||
    cropperImageRect.bottom < cropperCanvasRect.bottom ||
    cropperImageRect.left > cropperCanvasRect.left
  ) {
    event.preventDefault()
  }

  const selection = cropperSelection.value as Selection
  const maxSelection: Selection = {
    x: cropperImageRect.left - cropperCanvasRect.left,
    y: cropperImageRect.top - cropperCanvasRect.top,
    width: cropperImageRect.width,
    height: cropperImageRect.height
  }

  if (!inSelection(selection, maxSelection)) {
    event.preventDefault()
  }
}

const onCropperSelectionChange = (event: CustomEvent) => {
  if (!cropperCanvas.value) {
    return
  }

  const cropperCanvasRect = cropperCanvas.value.getBoundingClientRect()
  const selection = event.detail as Selection

  if (!cropperImage.value) return

  const cropperImageRect = cropperImage.value.getBoundingClientRect()
  const maxSelection: Selection = {
    x: cropperImageRect.left - cropperCanvasRect.left,
    y: cropperImageRect.top - cropperCanvasRect.top,
    width: cropperImageRect.width,
    height: cropperImageRect.height
  }

  if (!inSelection(selection, maxSelection)) {
    event.preventDefault()
  }
}

const apply = async () => {
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
