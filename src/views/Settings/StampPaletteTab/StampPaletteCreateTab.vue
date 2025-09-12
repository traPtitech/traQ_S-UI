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
    skipLeaveGuard.value = true
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
  if (!isDraftDirty.value) {
    goToSettingsStampPalette()
    return
  }
  try {
    await createStampPaletteWrapper(draftPalette.value)
    skipLeaveGuard.value = true
    addSuccessToast()
    goToSettingsStampPalette()
  } catch (_) {
    addFailureToast()
  }
}

const skipLeaveGuard = ref(false)

onBeforeUnmount(async () => {
  if (!isDraftDirty.value || skipLeaveGuard.value) return
  skipLeaveGuard.value = true
  if (!window.confirm('未保存の編集内容を保存しますか？')) return
  try {
    await createStampPaletteWrapper(draftPalette.value)
    addSuccessToast()
  } catch (_) {
    addFailureToast()
  }
})

useBeforeUnload(
  computed(() => isDraftDirty.value && !skipLeaveGuard.value),
  '未保存の編集内容があります。ページを離れますか？',
  _event => {
    skipLeaveGuard.value = true
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
