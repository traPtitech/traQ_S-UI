<template>
    <modal-frame
        title="カスタムテーマ"
        icon-name="edittheme"
    >
        <textarea-autosize v-model="editedTheme" :class="$style.jsonField" />
        <div :class="$style.import">
            <form-button
                label="保存"
                :disabled="!isChanged"
                type="primary"
                @click="applyTheme"
            />
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

<script lang = "ts" setup>
import FormButton from '/@/components/UI/FormButton.vue'
import TextareaAutosize from '/@/components/UI/TextareaAutosize.vue'
import ModalFrame from '../Common/ModalFrame.vue'

const state = reactive(useThemeSettings())
const changeTheme = (theme: Theme) => {
  state.custom = theme
}

const { editedTheme, isChanged, applyTheme } = useEditedThemes(
  state,
  changeTheme
)

</script>

<style lang="scss" module>
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
.import {
  display: flex;
  justify-content: center;
  margin: 12px;
}
</style>