<template>
  <modal-frame title="カスタムテーマ" icon-name="">
    <div :class="$style.content">
      <textarea-autosize v-model="editedTheme" :class="$style.jsonField" />
      <div :class="$style.buttonContainer">
        <form-button label="キャンセル" type="tertiary" @click="clearModal" />
        <form-button
          label="更新する"
          :disabled="!isChanged"
          type="primary"
          @click="applyTheme"
        />
      </div>
    </div>
  </modal-frame>
</template>

<script lang="ts">
import { computed, ref, watchEffect } from 'vue'
import type { Theme } from '/@/lib/theme/schema'
import { themeSchema } from '/@/lib/theme/schema'
import { dequal } from 'dequal'
import { useToastStore } from '/@/store/ui/toast'
import { reactive } from 'vue'
import { useThemeSettings } from '/@/store/app/themeSettings'

const useEditedThemes = (
  props: { custom: Theme },
  changeTheme: (theme: Theme) => void,
  clearModal: () => void
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
        clearModal()
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
import TextareaAutosize from '/@/components/UI/TextareaAutosize.vue'
import ModalFrame from '../Common/ModalFrame.vue'
import { useModalStore } from '/@/store/ui/modal'

const { clearModal } = useModalStore()

const state = reactive(useThemeSettings())
const changeTheme = (theme: Theme) => {
  state.custom = theme
}

const { editedTheme, isChanged, applyTheme } = useEditedThemes(
  state,
  changeTheme,
  clearModal
)
</script>

<style lang="scss" module>
.content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  align-self: stretch;
}

.jsonField {
  @include color-ui-primary;
  @include background-secondary;
  width: 100%;
  display: flex;
  max-height: 292px;
  align-items: flex-start;
  align-self: stretch;
  border-radius: 4px;
  border: solid 2px transparent;
  padding: 4px;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
.buttonContainer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  align-content: center;
  gap: 8px 16px;
  align-self: stretch;
  flex-wrap: wrap;
}
</style>
