<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, watch } from 'vue'
import { useQall } from '/@/composables/qall/useQall'
import FormButton from '/@/components/UI/FormButton.vue'
import ClickOutside from '/@/components/UI/ClickOutside'

const props = defineProps<{
  open: boolean
  videoInputs: MediaDeviceInfo[]
}>()

const emit = defineEmits<{
  (
    e: 'save',
    data: {
      backgroundType: 'original' | 'blur' | 'file' | 'screen'
      backgroundImage?: File
      selectedVideoInput?: MediaDeviceInfo
    }
  ): void
  (e: 'add'): void
  (e: 'close'): void
}>()

const backgroundType = ref<'original' | 'blur' | 'file' | 'screen'>('original')
const backgroundImage = ref<File | undefined>()
const selectedCamera = ref('')
const selectedVideoInput = ref<MediaDeviceInfo>()

const { addCameraTrack } = useQall()

watch(selectedCamera, () => {
  handleSave()
})
onMounted(() => {
  if (props.videoInputs[0] !== undefined && props.videoInputs.length > 0) {
    selectedCamera.value = props.videoInputs[0].deviceId
    selectedVideoInput.value = props.videoInputs[0]
  }
})

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    backgroundImage.value = target.files[0]
    handleSave()
  }
}

const handleSave = () => {
  const selectedVideoInput = props.videoInputs.find(
    d => d.deviceId === selectedCamera.value
  )

  emit('save', {
    backgroundType: backgroundType.value,
    backgroundImage: backgroundImage.value,
    selectedVideoInput
  })
}

const handleAddCameraTrack = () => {
  addCameraTrack(
    selectedVideoInput.value,
    backgroundType.value,
    backgroundImage.value
  )
  emit('add')
  emit('close')
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div v-if="open" :class="$style.popoverContainer">
    <ClickOutside @click-outside="handleClose">
      <div :class="$style.popoverContent">
        <div>
          <h3 :class="$style.popoverTitle">カメラ設定</h3>
          <div :class="$style.formGroup">
            <div :class="$style.formItem">
              <label for="camera-select" :class="$style.formItemLabel"
                >カメラを選択</label
              >
              <select
                id="camera-select"
                v-model="selectedCamera"
                :class="$style.input"
              >
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

            <div :class="$style.formItem">
              <label :class="$style.formItemLabel">背景を選択</label>
              <div :class="$style.radioGroup">
                <div :class="$style.radioItem">
                  <input
                    id="original"
                    v-model="backgroundType"
                    type="radio"
                    value="original"
                  />
                  <label for="original" :class="$style.radioLabel">
                    <span>何もしない</span>
                  </label>
                </div>
                <div :class="$style.radioItem">
                  <input
                    id="blur"
                    v-model="backgroundType"
                    type="radio"
                    value="blur"
                  />
                  <label for="blur" :class="$style.radioLabel">
                    <span>ぼかし</span>
                  </label>
                </div>
                <div :class="$style.radioItem">
                  <input
                    id="file"
                    v-model="backgroundType"
                    type="radio"
                    value="file"
                  />
                  <label for="file" :class="$style.radioLabel">
                    <span>ファイル</span>
                  </label>
                </div>
                <div :class="$style.radioItem">
                  <input
                    id="screen"
                    v-model="backgroundType"
                    type="radio"
                    value="screen"
                  />
                  <label for="screen" :class="$style.radioLabel">
                    <span>画面配信</span>
                  </label>
                </div>
              </div>
            </div>

            <div v-if="backgroundType === 'file'" :class="$style.formItem">
              <button type="button" :class="$style.fileButton">
                背景画像を選択
                <input
                  type="file"
                  :class="$style.fileInput"
                  accept="image/*,video/*"
                  @change="handleFileChange"
                />
              </button>
              <p v-if="backgroundImage" :class="$style.fileName">
                選択中: {{ backgroundImage.name }}
              </p>
            </div>
          </div>
        </div>

        <div :class="$style.actions">
          <FormButton
            label="カメラを追加"
            type="primary"
            @click="handleAddCameraTrack"
          />
        </div>
      </div>
    </ClickOutside>
  </div>
</template>

<style module lang="scss">
.popoverContainer {
  position: absolute;
  z-index: 50;
  bottom: 0;
}

.popoverContent {
  @include background-primary;
  @include color-ui-primary;
  padding: 24px;
  border-radius: 8px;
  width: 20rem;
  border: 1px solid $theme-text-primary-default;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.popoverTitle {
  font-size: 1.25rem;
  margin-bottom: 16px;
  font-weight: bold;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.formItem {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.formItemLabel {
  font-weight: bold;
}

.input {
  padding: 8px;
  border-radius: 4px;
  @include background-primary;
  @include color-ui-primary;
  border: 1px solid $theme-ui-secondary-default;
}

.radioGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radioItem {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radioLabel {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.fileButton {
  position: relative;
  padding: 12px 16px;
  border-radius: 4px;
  @include background-primary;
  @include color-ui-primary;
  border: 1px solid $theme-ui-secondary-default;
  cursor: pointer;
  overflow: hidden;
}

.fileInput {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.fileName {
  font-size: 0.875rem;
  color: $theme-text-secondary-default;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
</style>
