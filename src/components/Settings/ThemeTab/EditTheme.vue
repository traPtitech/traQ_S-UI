<template>
  <div :class="$style.content">
    <!--
    <form-button
      label="エクスポート"
      @click="onImportClick"
      :disabled="isImporterOpen"
      type="tertiary"
      :class="$style.element"
    />
    -->
    <form-button
      label="インポート/エクスポート"
      :disabled="isImporterOpen"
      type="tertiary"
      :class="$style.element"
      @click="onImportClick"
    />
    <!--
    <form-button
      label="選択中のテーマで上書き"
      @click="onUpdateClick"
      type="secondary"
      is-danger
      :class="$style.element"
    />
    -->
  </div>
  <template v-if="isImporterOpen">
    <textarea-autosize v-model="editedTheme" :class="$style.jsonField" />
    <div :class="$style.import">
      <form-button
        label="保存"
        :disabled="!isChanged"
        type="primary"
        @click="applyTheme"
      />
    </div>
  </template>
</template>

<script lang="ts">
import { computed, ref, watchEffect } from 'vue'
import type { Theme } from '/@/lib/theme/schema'
import { themeSchema } from '/@/lib/theme/schema'
import { dequal } from 'dequal'
import { useToastStore } from '/@/store/ui/toast'

const useEditedThemes = (
  props: { custom: Theme },
  emit: (name: 'changeTheme', theme: Theme) => void
) => {
  const { addErrorToast } = useToastStore()

  const appliedThemeStringified = computed(() => {
    const theme = props.custom
    return JSON.stringify(theme, null, '\t')
  })
  const editedTheme = ref(appliedThemeStringified.value)
  watchEffect(() => {
    editedTheme.value = appliedThemeStringified.value
  })
  const isChanged = computed(() => {
    try {
      return !dequal(JSON.parse(editedTheme.value), props.custom)
    } catch {
      return true
    }
  })

  const failedUpdateTheme = (text: string) => {
    addErrorToast(`テーマの更新に失敗しました: ${text}`)
  }

  const applyTheme = () => {
    try {
      const themeObj = JSON.parse(editedTheme.value)
      const res = themeSchema.safeParse(themeObj)
      if (res.success) {
        emit('changeTheme', res.data)
      } else {
        failedUpdateTheme(
          `構文エラー: ${res.error.issues
            .map(
              issue =>
                `[${issue.code}](${issue.path.join('.')}) ${issue.message}`
            )
            .join()}`
        )
      }
    } catch {
      failedUpdateTheme('無効なJSON')
    }
  }

  return { editedTheme, isChanged, applyTheme }
}

const useImporter = () => {
  const isImporterOpen = ref(false)
  const onImportClick = () => {
    isImporterOpen.value = true
  }
  return { isImporterOpen, onImportClick }
}
</script>

<script lang="ts" setup>
import FormButton from '/@/components/UI/FormButton.vue'
import TextareaAutosize from '/@/components/UI/TextareaAutosize.vue'

const props = defineProps<{
  custom: Theme
}>()

const emit = defineEmits<{
  (e: 'changeTheme', _theme: Theme): void
}>()

const { editedTheme, isChanged, applyTheme } = useEditedThemes(props, emit)

const { isImporterOpen, onImportClick } = useImporter()
</script>

<style lang="scss" module>
.content {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}
.element {
  align-self: flex-end;
}
.jsonField {
  @include color-ui-primary;
  @include background-secondary;
  width: 100%;
  margin-top: 12px;
  border-radius: 4px;
  border: solid 2px transparent;
  padding: 4px;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
.import {
  display: flex;
  justify-content: center;
  margin: 12px;
}
</style>
