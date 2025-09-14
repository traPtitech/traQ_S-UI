<template>
  <section :class="$style.section">
    <div :class="$style.sectionHeader">
      <h3>パレットの編集</h3>
      <stamp-palette-description />
    </div>
    <div v-if="!isStampPaletteFetched">
      <p>読み込み中...</p>
    </div>
    <div v-else-if="!draftPalette">
      <p>{{ stampPaletteFetchErrorMessage }}</p>
    </div>
    <div v-else-if="!isMyPalette">
      <p>スタンプパレットの編集権限がありません。</p>
    </div>
    <div v-else>
      <stamp-palette-editor v-model:palette="draftPalette" />
      <stamp-palette-action-buttons
        :palette="draftPalette"
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

const savedPalette = computed(() => stampPalettesMap.value.get(paletteId))
const draftPalette = ref<StampPalette | null>(null)

const isMyPalette = computed(() => {
  if (!savedPalette.value) return false
  return savedPalette.value.creatorId === myId.value
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
    draftPalette.value = structuredClone(
      toRaw(stampPalettesMap.value.get(paletteId)) ?? null
    )
    isStampPaletteFetched.value = true
  }
})

const isDraftDirty = computed(() => {
  if (!draftPalette.value || !savedPalette.value) return false
  return !areStampPalettesEqual(draftPalette.value, savedPalette.value)
})

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
  addInfoToast('スタンプパレットを更新しました')
}
const addFailureToast = () => {
  addErrorToast('スタンプパレットの更新に失敗しました')
}

const finalizeWithToast = async () => {
  if (!isDraftDirty.value) {
    goToSettingsStampPalette()
    return
  }
  try {
    if (!draftPalette.value) throw new Error('draftPalette is null')
    await editStampPaletteWrapper(draftPalette.value)
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
  if (!shouldWarnOnLeave.value || !draftPalette.value) return
  suppressLeaveWarning.value = true
  if (!window.confirm('未保存の編集内容を保存しますか？')) return
  try {
    await editStampPaletteWrapper(draftPalette.value)
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
