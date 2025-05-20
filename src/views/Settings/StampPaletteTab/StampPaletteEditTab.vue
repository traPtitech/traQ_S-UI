<template>
  <section>
    <h3>パレットの編集</h3>
    <div v-if="!editedStampPalette">
      <div>
        <p>スタンプパレットは存在しません。</p>
        <p>
          スタンプパレットは削除されたか、URLが間違っている可能性があります。
        </p>
      </div>
    </div>
    <stamp-palette-editor v-else v-model:palette="editedStampPalette" />
    <div :class="$style.buttons">
      <form-button label="キャンセル" @click="discardWithConfirm" />
      <form-button
        label="保存"
        type="primary"
        :disabled="!isPaletteValid || !hasPaletteUnsavedChanges"
        @click="saveWithToast"
      />
      <form-button
        label="確定"
        type="primary"
        :disabled="!isPaletteValid"
        @click="finalizeWithToast"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import { computed, ref, toRaw } from 'vue'
import StampPaletteEditor from '/@/components/Settings/StampPaletteTab/StampPaletteEditor.vue'
import {
  editStampPaletteWrapper,
  isStampPaletteEdited,
  isStampPaletteValid
} from '/@/components/Settings/StampPaletteTab/utils'
import FormButton from '/@/components/UI/FormButton.vue'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import router from '/@/router'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useToastStore } from '/@/store/ui/toast'
import type { StampPaletteId } from '/@/types/entity-ids'

const { paletteId } = defineProps<{
  paletteId: StampPaletteId
}>()

const { stampPalettesMap } = useStampPalettesStore()
const { execWithToast } = useExecWithToast()
const { addInfoToast, addErrorToast } = useToastStore()

const savedStampPalette = computed(() => stampPalettesMap.value.get(paletteId))
const editedStampPalette = ref<StampPalette | null>(
  savedStampPalette.value
    ? structuredClone(toRaw(savedStampPalette.value))
    : null
)

const isPaletteValid = computed(() => {
  if (!editedStampPalette.value) return false
  return isStampPaletteValid(editedStampPalette.value)
})

const hasPaletteUnsavedChanges = computed(() => {
  if (!editedStampPalette.value || !savedStampPalette.value) return false
  return isStampPaletteEdited(editedStampPalette.value, savedStampPalette.value)
})

const discardWithConfirm = () => {
  if (
    !hasPaletteUnsavedChanges.value ||
    window.confirm('未保存の編集内容が破棄されますが、よろしいですか？')
  ) {
    router.back()
  }
}

const saveStampPalette = async () => {
  if (!editedStampPalette.value) throw new Error('editedStampPalette is null')
  await editStampPaletteWrapper(editedStampPalette.value)
}

const saveWithToast = async () => {
  if (!isPaletteValid.value) {
    addErrorToast('パレット名を入力してください')
    return
  }
  await execWithToast(
    'スタンプパレットを保存しました',
    'スタンプパレットの保存に失敗しました',
    saveStampPalette
  )
}

const finalizeWithToast = async () => {
  if (!isPaletteValid.value) {
    addErrorToast('パレット名を入力してください')
    return
  }
  if (!hasPaletteUnsavedChanges.value) {
    router.back()
    return
  }
  try {
    await saveStampPalette()
    addInfoToast('スタンプパレットを保存しました')
    router.back()
  } catch (e) {
    addErrorToast('スタンプパレットの保存に失敗しました')
  }
}
</script>

<style lang="scss" module>
.buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
