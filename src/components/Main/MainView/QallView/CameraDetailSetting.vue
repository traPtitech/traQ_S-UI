<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import { useQall } from '/@/composables/qall/useQall'
import FormButton from '/@/components/UI/FormButton.vue'

const props = defineProps<{
  open: boolean
  videoInputs: MediaDeviceInfo[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'save',
    data: {
      backgroundType: 'original' | 'blur' | 'file' | 'screen'
      backgroundImage?: File
      selectedVideoInput: MediaDeviceInfo
    }
  ): void
}>()

const backgroundType = ref<'original' | 'blur' | 'file' | 'screen'>('original')
const backgroundImage = ref<File | undefined>()
const selectedCamera = ref('')
const selectedVideoInput = ref<MediaDeviceInfo>()

const { addCameraTrack } = useQall()

onMounted(() => {
  // 初期値として最初のカメラデバイスを設定
  if (props.videoInputs[0] !== undefined && props.videoInputs.length > 0) {
    selectedCamera.value = props.videoInputs[0].deviceId
    selectedVideoInput.value = props.videoInputs[0]
  }
})

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    backgroundImage.value = target.files[0]
  }
}

const handleSave = () => {
  const selectedVideoInput = props.videoInputs.find(
    d => d.deviceId === selectedCamera.value
  )
  if (selectedVideoInput) {
    emit('save', {
      backgroundType: backgroundType.value,
      backgroundImage: backgroundImage.value,
      selectedVideoInput
    })
  } else {
    console.error('No video input device selected')
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div v-if="open" class="popover-container">
    <div class="popover-content">
      <div>
        <h3 class="popover-title">カメラ設定</h3>
        <div class="form-group">
          <div class="form-item">
            <label for="camera-select" class="form-item-label"
              >カメラを選択</label
            >
            <select id="camera-select" v-model="selectedCamera" class="input">
              <option value="" disabled>選択してください</option>
              <option
                v-for="device in videoInputs"
                :key="device.deviceId"
                :value="device.deviceId"
              >
                {{ device.label || 'No Label' }}
              </option>
            </select>
          </div>

          <div class="form-item">
            <label class="form-item-label">背景を選択</label>
            <div class="radio-group">
              <div class="radio-item">
                <input
                  id="original"
                  v-model="backgroundType"
                  type="radio"
                  value="original"
                />
                <label for="original" class="radio-label">
                  <span>Original</span>
                </label>
              </div>
              <div class="radio-item">
                <input
                  id="blur"
                  v-model="backgroundType"
                  type="radio"
                  value="blur"
                />
                <label for="blur" class="radio-label">
                  <span>Blur</span>
                </label>
              </div>
              <div class="radio-item">
                <input
                  id="file"
                  v-model="backgroundType"
                  type="radio"
                  value="file"
                />
                <label for="file" class="radio-label">
                  <span>File</span>
                </label>
              </div>
              <div class="radio-item">
                <input
                  id="screen"
                  v-model="backgroundType"
                  type="radio"
                  value="screen"
                />
                <label for="screen" class="radio-label">
                  <span>Screen</span>
                </label>
              </div>
            </div>
          </div>

          <div v-if="backgroundType === 'file'" class="form-item">
            <button type="button" class="file-button">
              背景画像を選択
              <input
                type="file"
                class="file-input"
                accept="image/*"
                @change="handleFileChange"
              />
            </button>
            <p v-if="backgroundImage" class="file-name">
              選択中: {{ backgroundImage.name }}
            </p>
          </div>
        </div>
      </div>

      <div class="actions">
        <FormButton label="保存" type="primary" @click="handleSave" />
        <FormButton
          label="カメラを追加"
          type="tertiary"
          @click="
            addCameraTrack(selectedVideoInput, backgroundType, backgroundImage)
          "
        />
        <FormButton label="閉じる" type="secondary" @click="handleClose" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.popover-container {
  position: absolute;
  z-index: 50;
}

.popover-content {
  @include background-primary;
  @include color-ui-primary;
  padding: 24px;
  border-radius: 8px;
  width: 500px;
  border: 1px solid $theme-text-primary-default;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.popover-title {
  font-size: 1.25rem;
  margin-bottom: 16px;
  font-weight: bold;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item-label {
  font-weight: bold;
}

.input {
  padding: 8px;
  border-radius: 4px;
  @include background-primary;
  @include color-ui-primary;
  border: 1px solid $theme-ui-secondary-default;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-label {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.file-button {
  position: relative;
  padding: 12px 16px;
  border-radius: 4px;
  @include background-primary;
  @include color-ui-primary;
  border: 1px solid $theme-ui-secondary-default;
  cursor: pointer;
  overflow: hidden;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.file-name {
  font-size: 0.875rem;
  color: $theme-text-secondary-default;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
</style>
