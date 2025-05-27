<template>
  <section :class="$style.section">
    <div :class="$style.sectionHeader">
      <h3>パレットの作成</h3>
      <stamp-palette-description />
    </div>
    <stamp-palette-editor v-model:palette="newStampPalette" />
    <stamp-palette-action-buttons
      :palette="newStampPalette"
      :is-save-disabled="!hasPaletteUnsavedChanges"
      @save="saveWithToast"
      @finalize="finalizeWithToast"
      @cancel="discardWithConfirm"
    />
  </section>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import { computed, ref } from 'vue'
import StampPaletteActionButtons from '/@/components/Settings/StampPaletteTab/StampPaletteActionButtons.vue'
import StampPaletteDescription from '/@/components/Settings/StampPaletteTab/StampPaletteDescription.vue'
import StampPaletteEditor from '/@/components/Settings/StampPaletteTab/StampPaletteEditor.vue'
import {
  areStampPalettesEqual,
  createStampPaletteWrapper,
  editStampPaletteWrapper,
  goToSettingsStampPalette
} from '/@/components/Settings/StampPaletteTab/utils'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useToastStore } from '/@/store/ui/toast'
import type { StampId, StampPaletteId } from '/@/types/entity-ids'

const { stampPalettesMap } = useStampPalettesStore()
const { execWithToast } = useExecWithToast()
const { addInfoToast, addErrorToast } = useToastStore()

const emptyStampPalette: StampPalette = {
  id: '' as StampPaletteId,
  name: '',
  stamps: [] as StampId[],
  creatorId: '',
  createdAt: '',
  updatedAt: '',
  description: ''
}
const newStampPalette = ref(structuredClone(emptyStampPalette))
const savedStampPalette = computed(() =>
  stampPalettesMap.value.get(newStampPalette.value.id)
)

const hasPaletteUnsavedChanges = computed(() => {
  if (!savedStampPalette.value)
    return !areStampPalettesEqual(newStampPalette.value, emptyStampPalette)
  return !areStampPalettesEqual(newStampPalette.value, savedStampPalette.value)
})

const discardWithConfirm = () => {
  if (
    !hasPaletteUnsavedChanges.value ||
    window.confirm('未保存の編集内容が破棄されますが、よろしいですか？')
  ) {
    goToSettingsStampPalette()
  }
}

const saveStampPalette = async () => {
  if (newStampPalette.value.id === '') {
    newStampPalette.value = await createStampPaletteWrapper(
      newStampPalette.value
    )
  } else {
    await editStampPaletteWrapper(newStampPalette.value)
  }
}

const saveWithToast = async () => {
  await execWithToast(
    'スタンプパレットを保存しました',
    'スタンプパレットの保存に失敗しました',
    saveStampPalette
  )
}

const finalizeWithToast = async () => {
  if (!hasPaletteUnsavedChanges.value) {
    goToSettingsStampPalette()
    return
  }
  try {
    await saveStampPalette()
    addInfoToast('スタンプパレットを保存しました')
    goToSettingsStampPalette()
  } catch (e) {
    addErrorToast('スタンプパレットの保存に失敗しました')
  }
}
</script>

<style lang="scss" module>
.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sectionHeader {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
