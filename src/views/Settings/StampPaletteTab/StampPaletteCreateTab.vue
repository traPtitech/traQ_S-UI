<template>
  <section>
    <h3>パレットの作成</h3>
    <stamp-palette-editor v-model:palette="newStampPalette" />
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
import StampPaletteEditor from '/@/components/Settings/StampPaletteTab/StampPaletteEditor.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import router from '/@/router'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useToastStore } from '/@/store/ui/toast'
import type { StampId, StampPaletteId } from '/@/types/entity-ids'

const { stampPalettesMap, createStampPalette, editStampPalette } =
  useStampPalettesStore()
const { execWithToast } = useExecWithToast()
const { addInfoToast, addErrorToast } = useToastStore()

const newStampPalette = ref<StampPalette>({
  id: '' as StampPaletteId,
  name: '',
  stamps: [] as StampId[],
  creatorId: '',
  createdAt: '',
  updatedAt: '',
  description: ''
})
const savedStampPalette = computed(() =>
  stampPalettesMap.value.get(newStampPalette.value.id)
)

const isSavable = computed(() => {
  return newStampPalette.value.name !== ''
})

const isEdited = computed(() => {
  if (!savedStampPalette.value)
    return (
      newStampPalette.value.name !== '' ||
      newStampPalette.value.stamps.length > 0 ||
      newStampPalette.value.description !== ''
    )
  return (
    newStampPalette.value.name !== savedStampPalette.value.name ||
    JSON.stringify(newStampPalette.value.stamps) !==
      JSON.stringify(savedStampPalette.value.stamps) ||
    newStampPalette.value.description !== savedStampPalette.value.description
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
  if (newStampPalette.value.id === '') {
    newStampPalette.value = await createStampPalette({
      name: newStampPalette.value.name,
      stamps: new Set(newStampPalette.value.stamps),
      description: newStampPalette.value.description
    })
  } else {
    await editStampPalette(newStampPalette.value.id, {
      name: newStampPalette.value.name,
      stamps: new Set(newStampPalette.value.stamps),
      description: newStampPalette.value.description
    })
  }
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
