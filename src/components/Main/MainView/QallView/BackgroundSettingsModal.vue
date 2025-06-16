<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isOpen: boolean
  backgroundType: 'original' | 'blur' | 'file' | 'screen'
  onClose: () => void
  onApply: (type: 'original' | 'blur' | 'file' | 'screen', image?: File) => void
}

const props = defineProps<Props>()

const localBackgroundType = ref(props.backgroundType)
const backgroundImage = ref<File>()

const handleApply = () => {
  props.onApply(localBackgroundType.value, backgroundImage.value)
}
</script>

<template>
  <div v-if="isOpen" :class="$style.modal">
    <div :class="$style.modalContent">
      <h3>背景設定</h3>
      <div :class="$style.modalBody">
        <div :class="$style.backgroundOptions">
          <div>
            <input
              id="original"
              v-model="localBackgroundType"
              type="radio"
              value="original"
            />
            <label for="original">オリジナル</label>
          </div>
          <div>
            <input
              id="blur"
              v-model="localBackgroundType"
              type="radio"
              value="blur"
            />
            <label for="blur">ぼかし</label>
          </div>
          <div>
            <input
              id="file"
              v-model="localBackgroundType"
              type="radio"
              value="file"
            />
            <label for="file">画像</label>
          </div>
          <div>
            <input
              id="screen"
              v-model="localBackgroundType"
              type="radio"
              value="screen"
            />
            <label for="screen">画面共有</label>
          </div>
        </div>

        <div v-if="localBackgroundType === 'file'" :class="$style.fileUpload">
          <input
            type="file"
            accept="image/*"
            @change="
              e => {
                const target = e.target as HTMLInputElement
                backgroundImage = target?.files?.[0]
              }
            "
          />
        </div>

        <div :class="$style.modalButtons">
          <button :class="$style.cancelButton" @click="onClose">
            キャンセル
          </button>
          <button :class="$style.applyButton" @click="handleApply">適用</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" module>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modalContent {
  @include background-primary;
  padding: 24px;
  border-radius: 8px;
  width: 400px;

  h3 {
    margin: 0 0 16px;
    font-size: 18px;
    font-weight: bold;
    @include color-ui-primary;
  }
}

.modalBody {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.backgroundOptions {
  display: flex;
  flex-direction: column;
  gap: 12px;

  div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  label {
    @include color-ui-primary;
  }
}

.fileUpload {
  margin-top: 8px;
}

.modalButtons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;

  button {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: bold;
  }
}

.cancelButton {
  background-color: transparent;
  border: 1px solid $theme-ui-secondary;
  color: $theme-ui-secondary;

  &:hover {
    background-color: rgba($theme-ui-secondary, 0.1);
  }
}

.applyButton {
  background-color: $theme-accent-primary;
  color: white;

  &:hover {
    background-color: darken($theme-accent-primary, 5%);
  }
}
</style>
