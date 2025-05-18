<template>
  <section>
    <h3>パレットの編集</h3>
    <div v-if="!editablePalette">
      <div>
        <p>スタンプパレットは存在しません。</p>
        <p>
          スタンプパレットは削除されたか、URLが間違っている可能性があります。
        </p>
      </div>
    </div>
    <stamp-palette-editor v-else v-model:palette="editablePalette" />
    <div :class="$style.buttons">
      <form-button label="キャンセル" @click="discardWithConfirm" />
      <form-button
        label="保存"
        type="primary"
        :disabled="!isSavable || !isEdited"
        @click="saveWithToast"
      />
      <form-button
        label="確定"
        type="primary"
        :disabled="!isSavable"
        @click="finalizeWithToast"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import { computed, ref } from 'vue'
import StampPaletteEditor from '/@/components/Settings/StampPalette/StampPaletteEditor.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import router from '/@/router'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useToastStore } from '/@/store/ui/toast'
import type { StampPaletteId } from '/@/types/entity-ids'

const { paletteId } = defineProps<{
  paletteId: StampPaletteId
}>()

const { stampPalettesMap, editStampPalette } = useStampPalettesStore()
const { execWithToast } = useExecWithToast()
const { addInfoToast, addErrorToast } = useToastStore()

const savedStampPalette = computed(() => stampPalettesMap.value.get(paletteId))
const editablePalette = ref<StampPalette | null>(
  savedStampPalette.value
    ? JSON.parse(JSON.stringify(savedStampPalette.value))
    : null
)

const isSavable = computed(() => {
  if (!editablePalette.value) return false
  return editablePalette.value.name !== ''
})

const isEdited = computed(() => {
  if (!editablePalette.value || !savedStampPalette.value) return false
  return (
    editablePalette.value.name !== savedStampPalette.value.name ||
    JSON.stringify(editablePalette.value.stamps) !==
      JSON.stringify(savedStampPalette.value.stamps) ||
    editablePalette.value.description !== savedStampPalette.value.description
  )
})

const discardWithConfirm = () => {
  if (
    !isEdited.value ||
    window.confirm('未保存の編集内容が破棄されますが、よろしいですか？')
  ) {
    router.back()
  }
}

const saveStampPalette = async () => {
  if (!editablePalette.value) throw new Error('editablePalette is null')
  await editStampPalette(editablePalette.value.id, {
    name: editablePalette.value.name,
    stamps: new Set(editablePalette.value.stamps),
    description: editablePalette.value.description
  })
}

const saveWithToast = async () => {
  if (!isSavable.value) {
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
  if (!isSavable.value) {
    addErrorToast('パレット名を入力してください')
    return
  }
  if (!isEdited.value) {
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
