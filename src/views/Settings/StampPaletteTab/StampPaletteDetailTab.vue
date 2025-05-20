<template>
  <section :class="$style.section">
    <div :class="$style.sectionHeader">
      <h3>パレットの編集</h3>
      <StampPaletteDescription />
    </div>
    <div v-if="!isStampPaletteFetched"></div>
    <div v-else-if="!stampPaletteToEdit || !isMyPalette">
      <div>
        <p>スタンプパレットは存在しません。</p>
        <p>
          スタンプパレットは削除されたか、URLが間違っている可能性があります。
        </p>
      </div>
    </div>
    <div v-else>
      <stamp-palette-editor v-model:palette="stampPaletteToEdit" />
      <StampPaletteActionButtons
        :palette="stampPaletteToEdit"
        :is-save-disabled="!hasPaletteUnsavedChanges"
        @save="saveWithToast"
        @finalize="finalizeWithToast"
        @cancel="discardWithConfirm"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import { computed, onBeforeMount, ref, toRaw } from 'vue'
import StampPaletteActionButtons from '/@/components/Settings/StampPaletteTab/StampPaletteActionButtons.vue'
import StampPaletteDescription from '/@/components/Settings/StampPaletteTab/StampPaletteDescription.vue'
import StampPaletteEditor from '/@/components/Settings/StampPaletteTab/StampPaletteEditor.vue'
import {
  editStampPaletteWrapper,
  goToSettingsStampPalette,
  isStampPaletteEdited
} from '/@/components/Settings/StampPaletteTab/utils'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import { useMeStore } from '/@/store/domain/me'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useToastStore } from '/@/store/ui/toast'
import type { StampPaletteId } from '/@/types/entity-ids'

const { paletteId } = defineProps<{
  paletteId: StampPaletteId
}>()

const { fetchStampPalette, stampPalettesMap } = useStampPalettesStore()
const { execWithToast } = useExecWithToast()
const { addInfoToast, addErrorToast } = useToastStore()
const { myId } = useMeStore()

const savedStampPalette = computed(() => stampPalettesMap.value.get(paletteId))
const stampPaletteToEdit = ref<StampPalette | null>(null)

const isMyPalette = computed(() => {
  if (!savedStampPalette.value) return false
  return savedStampPalette.value.creatorId === myId.value
})
const isStampPaletteFetched = ref(false)

onBeforeMount(async () => {
  await fetchStampPalette({ stampPaletteId: paletteId })
  stampPaletteToEdit.value = structuredClone(
    toRaw(stampPalettesMap.value.get(paletteId)) ?? null
  )
  isStampPaletteFetched.value = true
})

const hasPaletteUnsavedChanges = computed(() => {
  if (!stampPaletteToEdit.value || !savedStampPalette.value) return false
  return isStampPaletteEdited(stampPaletteToEdit.value, savedStampPalette.value)
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
  if (!stampPaletteToEdit.value) throw new Error('stampPaletteToEdit is null')
  await editStampPaletteWrapper(stampPaletteToEdit.value)
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
.buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
