<template>
  <modal-frame title="新規スタンプ登録" :subtitle="subtitle">
    <stamp-image-edit
      v-if="step === 'image'"
      :file="file"
      @update-file="updateFile"
    />
    <stamp-info-edit v-else :stamp-image="stampImage" @back="backToImageEdit" />
  </modal-frame>
</template>

<script lang="ts" setup>
import ModalFrame from '/@/components/Modal/Common/ModalFrame.vue'
import { ref, computed } from 'vue'
import StampImageEdit from './StampImageEdit.vue'
import StampInfoEdit from './StampInfoEdit.vue'

const props = defineProps<{
  file: File
}>()

const stampImage = ref<File>(props.file)

const step = ref<'image' | 'info'>('image')
const subtitle = computed(() =>
  step.value === 'image'
    ? '画像の位置・サイズを編集できます'
    : 'スタンプの名前を入力してください'
)

const updateFile = (file: File) => {
  stampImage.value = file
  step.value = 'info'
}
const backToImageEdit = () => {
  step.value = 'image'
}
</script>

<style lang="scss" module>
.form {
  margin: 8px 0;
}

.container {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.leftContainer {
  min-width: 136px;
  width: 136px;
  height: 136px;
  margin: 8px 0;
  flex-grow: 1;
}
.imgButton {
  width: 100%;
  height: 100%;
  border: 2px solid $theme-ui-secondary-default;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.label {
  @include color-ui-secondary;
  margin-bottom: 16px;
}
.creator {
  @include color-ui-primary;
}
.note {
  @include color-ui-secondary;
  margin-bottom: 12px;
  font-size: 12px;
}
.buttonContainer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}
</style>
