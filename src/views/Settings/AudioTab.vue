<template>
  <div :class="$style.container">
    <h2>音声ファイル管理</h2>
    <div :class="$style.content">
      <div :class="$style.fileSection">
        <input
          ref="fileInput"
          type="file"
          accept="audio/*"
          style="display: none"
          @change="handleFileSelect"
        />
        <form-button
          label="音声ファイルを選択"
          type="secondary"
          icon="plus"
          mdi
          @click="openFileDialog"
        />
      </div>
      <div v-if="selectedFile" :class="$style.fileInfo">
        <p>選択されたファイル: {{ selectedFile.name }}</p>
        <div :class="$style.nameInput">
          <label for="audioName">ファイル名: </label>
          <input
            id="audioName"
            v-model="audioName"
            type="text"
            placeholder="音声ファイルの名前を入力"
            required
          />
        </div>
        <form-button
          label="アップロード"
          type="primary"
          :disabled="!audioName"
          @click="handleUpload"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import FormButton from '/@/components/UI/FormButton.vue'

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const audioName = ref('')

const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  selectedFile.value = file
  audioName.value = file.name.replace(/\.[^/.]+$/, '')
  console.log('Selected audio file:', file.name)
}

const handleUpload = () => {
  if (!selectedFile.value || !audioName.value) return

  // TODO: Qall
  // 実際のアップロード処理を実装
  console.log('Selected audio file:', selectedFile.value.name)
  console.log('Set name:', audioName.value)

  selectedFile.value = null
  audioName.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style lang="scss" module>
.container {
  padding: 16px;
}
.content {
  margin-top: 16px;
}
.fileSection {
  margin-bottom: 16px;
}
.fileInfo {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.nameInput {
  display: flex;
  align-items: center;
  gap: 8px;

  input {
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 300px;
  }
}
</style>
