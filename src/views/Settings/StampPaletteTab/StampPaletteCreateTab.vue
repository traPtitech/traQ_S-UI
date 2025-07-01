<template>
  <section :class="$style.section">
    <div :class="$style.sectionHeader">
      <h3>パレットの作成</h3>
      <stamp-palette-description />
    </div>
    <stamp-palette-editor v-model:palette="newStampPalette" />
    <stamp-palette-action-buttons
      :palette="newStampPalette"
      @finalize="finalizeWithToast"
      @cancel="discardWithConfirm"
    />
  </section>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import { computed, onBeforeUnmount, ref } from 'vue'
import StampPaletteActionButtons from '/@/components/Settings/StampPaletteTab/StampPaletteActionButtons.vue'
import StampPaletteDescription from '/@/components/Settings/StampPaletteTab/StampPaletteDescription.vue'
import StampPaletteEditor from '/@/components/Settings/StampPaletteTab/StampPaletteEditor.vue'
import {
  areStampPalettesEqual,
  createStampPaletteWrapper,
  goToSettingsStampPalette
} from '/@/components/Settings/StampPaletteTab/utils'
import { useBeforeUnload } from '/@/composables/dom/useBeforeUnload'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useToastStore } from '/@/store/ui/toast'
import type { StampId, StampPaletteId } from '/@/types/entity-ids'

const { stampPalettesMap } = useStampPalettesStore()
const { addInfoToast, addErrorToast } = useToastStore()

const emptyStampPalette: StampPalette = {
  id: '' as StampPaletteId,
  name: '新規パレット',
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

const addSuccessToast = () => {
  addInfoToast('スタンプパレットを保存しました')
}
const addFailureToast = () => {
  addErrorToast('スタンプパレットの保存に失敗しました')
}

const finalizeWithToast = async () => {
  if (!hasPaletteUnsavedChanges.value) {
    goToSettingsStampPalette()
    return
  }
  try {
    await createStampPaletteWrapper(newStampPalette.value)
    addSuccessToast()
    goToSettingsStampPalette()
  } catch (e) {
    addFailureToast()
  }
}

const isConfirmed = ref(false)

onBeforeUnmount(async () => {
  if (!hasPaletteUnsavedChanges.value || isConfirmed.value) return
  isConfirmed.value = true
  if (!window.confirm('未保存の編集内容を保存しますか？')) return
  try {
    await createStampPaletteWrapper(newStampPalette.value)
    addSuccessToast()
  } catch (e) {
    addFailureToast()
  }
})

useBeforeUnload(
  computed(() => hasPaletteUnsavedChanges.value && !isConfirmed.value),
  '未保存の編集内容があります。ページを離れますか？',
  event => {
    isConfirmed.value = true
  }
)
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
