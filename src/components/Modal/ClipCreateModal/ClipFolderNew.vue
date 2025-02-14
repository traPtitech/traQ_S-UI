<template>
  <div :class="$style.container">
    <a-icon :class="$style.icon" mdi name="bookmark" />
    <div :class="$style.inputContainer">
      <input
        v-model="clipFolderName"
        type="text"
        :class="$style.input"
        placeholder="クリップフォルダを新規作成"
      />
      <length-count :val="clipFolderName" :max-length="30" />
    </div>
    <button
      :class="$style.button"
      :disabled="clipFolderName.length === 0 || isExceeded || adding"
      @click="createClipFolder"
    >
      <a-icon name="plus" mdi :class="$style.icon" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import useMaxLength from '/@/composables/utils/useMaxLength'
import apis from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import LengthCount from '/@/components/UI/LengthCount.vue'
import type { ClipFolderId } from '/@/types/entity-ids'

const emit = defineEmits<{
  (e: 'createClipFolder', id: ClipFolderId): void
}>()

const { addErrorToast } = useToastStore()

const clipFolderName = ref('')
const adding = ref(false)
const { isExceeded } = useMaxLength(
  reactive({ val: clipFolderName, maxLength: 30 })
)

const createClipFolder = async () => {
  adding.value = true
  try {
    const newClipFolder = (await apis.createClipFolder({
      name: clipFolderName.value,
      description: ''
    })).data
    clipFolderName.value = ''
    emit('createClipFolder', newClipFolder.id)
  } catch {
    addErrorToast('クリップフォルダの作成に失敗しました')
  }
  adding.value = false
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: flex;
  cursor: pointer;
  gap: 8px;
  padding: 8px 0;
}
.icon {
  vertical-align: middle;
}

.inputContainer {
  @include color-ui-secondary;
  @include background-secondary;
  display: flex;
  align-items: center;
  flex: 1 1;
  padding: 4px;
  border-radius: 6px;
}

.input {
  @include color-text-primary;
  width: 100%;
  padding: 0 8px;
  &::placeholder {
    @include color-ui-secondary;
  }
}

.button {
  @include color-ui-secondary;
  @include background-secondary;
  padding: 0 12px;
  margin-left: 8px;
  border-radius: 6px;
  cursor: pointer;
  &:disabled {
    cursor: not-allowed;
  }
}
</style>
