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
      label="import/export"
      type="secondary"
      :class="$style.element"
      @click="openEditThemeModal"
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
</template>

<script lang="ts">
import { computed, ref, watchEffect } from 'vue'
import type { Theme } from '/@/lib/theme/schema'
import { themeSchema } from '/@/lib/theme/schema'
import { dequal } from 'dequal'
import { useToastStore } from '/@/store/ui/toast'
import { reactive } from 'vue'
import { useThemeSettings } from '/@/store/app/themeSettings'
import { useModalStore } from '/@/store/ui/modal'

const useEditedThemes = (
  props: { custom: Theme },
  changeTheme: (theme: Theme) => void
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
        changeTheme(res.data)
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
</script>

<script lang="ts" setup>
import FormButton from '/@/components/UI/FormButton.vue'

const state = reactive(useThemeSettings())
const changeTheme = (theme: Theme) => {
  state.custom = theme
}

const { editedTheme, isChanged, applyTheme } = useEditedThemes(
  state,
  changeTheme
)

const { pushModal } = useModalStore()

const openEditThemeModal = () => pushModal({ type: 'edittheme' })
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
</style>
