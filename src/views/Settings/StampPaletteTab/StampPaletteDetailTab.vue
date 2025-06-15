<template>
  <section :class="$style.section">
    <div :class="$style.sectionHeader">
      <h3>パレットの編集</h3>
      <stamp-palette-description />
    </div>
    <div v-if="!isStampPaletteFetched">
      <p>読み込み中...</p>
    </div>
    <div v-else-if="!stampPaletteToEdit">
      <p>{{ stampPaletteFetchErrorMessage }}</p>
    </div>
    <div v-else-if="!isMyPalette">
      <p>スタンプパレットの編集権限がありません。</p>
    </div>
    <div v-else>
      <stamp-palette-editor v-model:palette="stampPaletteToEdit" />
      <stamp-palette-action-buttons
        :palette="stampPaletteToEdit"
        @finalize="finalizeWithToast"
        @cancel="discardWithConfirm"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import { isAxiosError } from 'axios'
import { computed, onBeforeMount, onBeforeUnmount, ref, toRaw } from 'vue'
import StampPaletteActionButtons from '/@/components/Settings/StampPaletteTab/StampPaletteActionButtons.vue'
import StampPaletteDescription from '/@/components/Settings/StampPaletteTab/StampPaletteDescription.vue'
import StampPaletteEditor from '/@/components/Settings/StampPaletteTab/StampPaletteEditor.vue'
import {
  areStampPalettesEqual,
  editStampPaletteWrapper,
  goToSettingsStampPalette
} from '/@/components/Settings/StampPaletteTab/utils'
import { useBeforeUnload } from '/@/composables/dom/useBeforeUnload'
import { useMeStore } from '/@/store/domain/me'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useToastStore } from '/@/store/ui/toast'
import type { StampPaletteId } from '/@/types/entity-ids'

const { paletteId } = defineProps<{
  paletteId: StampPaletteId
}>()

const { fetchStampPalette, stampPalettesMap } = useStampPalettesStore()
const { addInfoToast, addErrorToast } = useToastStore()
const { myId } = useMeStore()

const savedStampPalette = computed(() => stampPalettesMap.value.get(paletteId))
const stampPaletteToEdit = ref<StampPalette | null>(null)

const isMyPalette = computed(() => {
  if (!savedStampPalette.value) return false
  return savedStampPalette.value.creatorId === myId.value
})

const stampPaletteFetchErrorMessage = ref('')
const setStampPaletteFetchErrorMessage = (error: unknown) => {
  if (!isAxiosError(error) || !error.response) {
    stampPaletteFetchErrorMessage.value =
      'スタンプパレットの取得に失敗しました。'
    return
  }
  const status = error.response.status
  if (status === 404) {
    stampPaletteFetchErrorMessage.value =
      'スタンプパレットが見つかりませんでした。削除されたか、URLが間違っている可能性があります。'
  } else if (status === 401 || status === 403) {
    stampPaletteFetchErrorMessage.value =
      'このスタンプパレットを表示する権限がありません。'
  } else {
    stampPaletteFetchErrorMessage.value =
      'スタンプパレットの取得に失敗しました。'
  }
}
const isStampPaletteFetched = ref(false)

onBeforeMount(async () => {
  try {
    await fetchStampPalette({ stampPaletteId: paletteId })
  } catch (e: unknown) {
    setStampPaletteFetchErrorMessage(e)
  } finally {
    stampPaletteToEdit.value = structuredClone(
      toRaw(stampPalettesMap.value.get(paletteId)) ?? null
    )
    isStampPaletteFetched.value = true
  }
})

const hasPaletteUnsavedChanges = computed(() => {
  if (!stampPaletteToEdit.value || !savedStampPalette.value) return false
  return !areStampPalettesEqual(
    stampPaletteToEdit.value,
    savedStampPalette.value
  )
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
    if (!stampPaletteToEdit.value) throw new Error('stampPaletteToEdit is null')
    await editStampPaletteWrapper(stampPaletteToEdit.value)
    addSuccessToast()
    goToSettingsStampPalette()
  } catch (e) {
    addFailureToast()
  }
}

const isConfirmed = ref(false)

onBeforeUnmount(async () => {
  if (
    !hasPaletteUnsavedChanges.value ||
    !stampPaletteToEdit.value ||
    isConfirmed.value
  )
    return
  isConfirmed.value = true
  if (!window.confirm('未保存の編集内容を保存しますか？')) return
  try {
    await editStampPaletteWrapper(stampPaletteToEdit.value)
    addSuccessToast()
  } catch (e) {
    addFailureToast()
  }
})

useBeforeUnload(
  hasPaletteUnsavedChanges,
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
