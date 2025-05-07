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
        <AStamp v-if="stampId" :stamp-id="stampId" :size="32" />
        <div ref="stampPickerButton">
          <form-button
            label="アイコンスタンプを選択"
            type="secondary"
            icon="plus"
            mdi
            @click="toggleStampPicker"
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

    <!-- サウンド一覧の表示 -->
    <div v-if="soundboardList.length" :class="$style.listSection">
      <h3>登録されている音声一覧</h3>
      <ul>
        <li
          v-for="item in soundboardList"
          :key="item.soundId"
          :class="$style.soundItem"
        >
          <!-- 音声の名前表示 -->
          <span>{{ item.soundName }}</span>
          <!-- Stampアイコンなど表示したければ、stampIdとcreatorId等も表示 -->
          <AStamp v-if="item.stampId" :stamp-id="item.stampId" :size="20" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, useTemplateRef } from 'vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { useStampPickerInvoker } from '/@/store/ui/stampPicker'
import AStamp from '/@/components/UI/AStamp.vue'

// UI imports
import { useToastStore } from '/@/store/ui/toast'

// Qall関連のcomposableを利用
import type { SoundboardItem } from '@traptitech/traq'
import apis from '/@/lib/apis'

// UI・状態
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const audioName = ref('')

// StampPicker関連
const stampId = ref('')
const stampPickerButton = useTemplateRef<HTMLButtonElement>('stampPickerButton')
const { toggleStampPicker } = useStampPickerInvoker(
  async stampData => {
    stampId.value = stampData.id
  },
  stampPickerButton,
  false,
  'bottom-left'
)
const soundboardList = ref<SoundboardItem[]>([])

// エラーメッセージなどUI表示
const { addErrorToast, addSuccessToast } = useToastStore()

/**
 * ファイル選択ダイアログを開く
 */
const openFileDialog = () => {
  fileInput.value?.click()
}

/**
 * 選択されたファイルをstateに保存
 */
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  selectedFile.value = file
  audioName.value = file.name.replace(/\.[^/.]+$/, '')
}

/**
 * アップロードボタン押下時
 */
const handleUpload = async () => {
  if (!selectedFile.value) {
    addErrorToast('音声ファイルが指定されていません')
    return
  }
  if (!audioName.value) {
    addErrorToast('音声名が指定されていません')
    return
  }
  if (!stampId.value) {
    addErrorToast('スタンプIDが指定されていません')
    return
  }

  try {
    await apis.postSoundboard(
      selectedFile.value,
      audioName.value,
      stampId.value
    ) // 必須フィールドを送信
    addSuccessToast('アップロードが完了しました')
    await loadSoundboardList() // サウンド一覧を再取得
    resetUploadForm() // フォームリセット
  } catch (e) {
    addErrorToast(`アップロードに失敗しました: ${String(e)}`)
  }
}

const resetUploadForm = () => {
  selectedFile.value = null
  audioName.value = ''
  stampId.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * サウンド一覧を読み込み
 */
const loadSoundboardList = async () => {
  try {
    const list = (await apis.getSoundboardList()).data
    soundboardList.value = list
  } catch (e) {
    addErrorToast(`サウンド一覧の取得に失敗しました: ${String(e)}`)
  }
}

onMounted(() => {
  loadSoundboardList()
})
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

/* 音声一覧 */
.listSection {
  margin-top: 16px;
  margin-bottom: 24px;

  ul {
    list-style: none;
    padding: 0;
  }
}
.soundItem {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
</style>
