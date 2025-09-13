<template>
  <section :class="$style.section">
    <div :class="$style.sectionHeader">
      <h3>パレットの作成</h3>
      <stamp-palette-description />
    </div>
    <stamp-palette-editor v-model:palette="draftPalette" />
    <stamp-palette-action-buttons
      :palette="draftPalette"
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
import { useToastStore } from '/@/store/ui/toast'
import type { StampId, StampPaletteId } from '/@/types/entity-ids'

const { addInfoToast, addErrorToast } = useToastStore()

const initialPalette: StampPalette = {
  id: '' as StampPaletteId,
  name: '新規パレット',
  stamps: [] as StampId[],
  creatorId: '',
  createdAt: '',
  updatedAt: '',
  description: ''
}
const draftPalette = ref(structuredClone(initialPalette))

const isDraftDirty = computed(
  () => !areStampPalettesEqual(draftPalette.value, initialPalette)
)

const discardWithConfirm = () => {
  if (
    !isDraftDirty.value ||
    window.confirm('未保存の編集内容が破棄されますが、よろしいですか？')
  ) {
    suppressLeaveWarning.value = true
    goToSettingsStampPalette()
  }
}

const addSuccessToast = () => {
  addInfoToast('スタンプパレットを作成しました')
}
const addFailureToast = () => {
  addErrorToast('スタンプパレットの作成に失敗しました')
}

const finalizeWithToast = async () => {
  if (!isDraftDirty.value) {
    goToSettingsStampPalette()
    return
  }
  try {
    await createStampPaletteWrapper(draftPalette.value)
    suppressLeaveWarning.value = true
    addSuccessToast()
    goToSettingsStampPalette()
  } catch (_) {
    addFailureToast()
  }
}

const suppressLeaveWarning = ref(false)

const shouldWarnOnLeave = computed(
  () => isDraftDirty.value && !suppressLeaveWarning.value
)

onBeforeUnmount(async () => {
  if (!shouldWarnOnLeave.value) return
  suppressLeaveWarning.value = true
  if (!window.confirm('未保存の編集内容を保存しますか？')) return
  try {
    await createStampPaletteWrapper(draftPalette.value)
    addSuccessToast()
  } catch (_) {
    addFailureToast()
  }
})

useBeforeUnload(
  shouldWarnOnLeave,
  '未保存の編集内容があります。ページを離れますか？'
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
