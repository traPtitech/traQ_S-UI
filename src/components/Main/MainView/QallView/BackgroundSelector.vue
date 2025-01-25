<script setup lang="ts">
import { ref, defineEmits } from 'vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: { backgroundType: string; backgroundImage?: File }): void
}>()

const backgroundType = ref<'original' | 'blur' | 'file' | 'screen'>('original')

const backgroundImage = ref<File | undefined>()

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    backgroundImage.value = target.files[0]
  }
}

const handleSave = () => {
  emit('save', {
    backgroundType: backgroundType.value,
    backgroundImage: backgroundImage.value
  })
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="backgroundSelector">
    <h3>背景を選択</h3>
    <div class="radioGroup">
      <label>
        <input v-model="backgroundType" type="radio" value="original" />
        Original
      </label>
      <label>
        <input v-model="backgroundType" type="radio" value="blur" />
        Blur
      </label>
      <label>
        <input v-model="backgroundType" type="radio" value="file" />
        File
      </label>
      <label>
        <input v-model="backgroundType" type="radio" value="screen" />
        Screen
      </label>
    </div>
    <!-- file選択中のみファイルアップロードを表示 -->
    <div v-if="backgroundType === 'file'" class="fileUpload">
      <input type="file" @change="handleFileChange" />
      <p v-if="backgroundImage">選択中: {{ backgroundImage.name }}</p>
    </div>
    <div class="buttons">
      <button @click="handleSave">保存</button>
      <button @click="handleClose">キャンセル</button>
    </div>
  </div>
</template>

<style module lang="scss">
.backgroundSelector {
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  width: 300px;
}

.radioGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.fileUpload {
  margin-bottom: 16px;
}

.buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
