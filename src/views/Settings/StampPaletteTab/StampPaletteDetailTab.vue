<template>
  <section :class="$style.section">
    <div :class="$style.sectionHeader">
      <h3>パレットの編集</h3>
      <StampPaletteDescription />
    </div>
    <div v-if="!isStampPaletteFetched"></div>
    <div v-else-if="!editedStampPalette || !isMyPalette">
      <div>
        <p>スタンプパレットは存在しません。</p>
        <p>
          スタンプパレットは削除されたか、URLが間違っている可能性があります。
        </p>
      </div>
    </div>
    <div v-else>
      <stamp-palette-editor v-model:palette="editedStampPalette" />
      <div :class="$style.buttons">
        <form-button
          label="キャンセル"
          type="tertiary"
          @click="discardWithConfirm"
        />
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
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import { computed, onBeforeMount, ref, toRaw } from 'vue'
import StampPaletteDescription from '/@/components/Settings/StampPaletteTab/StampPaletteDescription.vue'
import StampPaletteEditor from '/@/components/Settings/StampPaletteTab/StampPaletteEditor.vue'
import {
  editStampPaletteWrapper,
  isStampPaletteEdited,
  isStampPaletteValid
} from '/@/components/Settings/StampPaletteTab/utils'
import FormButton from '/@/components/UI/FormButton.vue'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import router from '/@/router'
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
const editedStampPalette = ref<StampPalette | null>(null)

const isMyPalette = computed(() => {
  if (!savedStampPalette.value) return false
  return savedStampPalette.value.creatorId === myId.value
})
const isStampPaletteFetched = ref(false)

onBeforeMount(async () => {
  await fetchStampPalette({ stampPaletteId: paletteId })
  editedStampPalette.value = structuredClone(
    toRaw(stampPalettesMap.value.get(paletteId)) ?? null
  )
  isStampPaletteFetched.value = true
})

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
