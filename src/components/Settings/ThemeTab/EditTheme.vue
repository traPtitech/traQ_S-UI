<template>
  <div :class="$style.content">
    <!--
    <form-button
      label="エクスポート"
      @click="onImportClick"
      :disabled="isImporterOpen"
      color="secondary"
      :class="$style.element"
    />
    -->
    <form-button
      label="インポート/エクスポート"
      :disabled="isImporterOpen"
      color="secondary"
      :class="$style.element"
      @click="onImportClick"
    />
    <!--
    <form-button
      label="選択中のテーマで上書き"
      @click="onUpdateClick"
      color="error"
      :class="$style.element"
    />
    -->
  </div>
  <template v-if="isImporterOpen">
    <textarea-autosize
      :model-value="editedTheme"
      :class="$style.jsonField"
      @update:model-value="updateEditedTheme"
    />
    <div :class="$style.import">
      <form-button
        label="保存"
        :disabled="!isChanged"
        color="primary"
        @click="applyTheme"
      />
    </div>
  </template>
</template>

<script lang="ts">
import { defineComponent, computed, ref, PropType, watchEffect } from 'vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { Theme, themeSchema } from '/@/lib/theme/schema'
import { dequal } from 'dequal'
import TextareaAutosize from '/@/components/UI/TextareaAutosize.vue'
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
  const updateEditedTheme = (theme: string) => {
    editedTheme.value = theme
  }
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

  return { editedTheme, updateEditedTheme, isChanged, applyTheme }
}

const useImporter = () => {
  const isImporterOpen = ref(false)
  const onImportClick = () => {
    isImporterOpen.value = true
  }
  return { isImporterOpen, onImportClick }
}

export default defineComponent({
  name: 'EditTheme',
  components: {
    FormButton,
    TextareaAutosize
  },
  props: {
    custom: {
      type: Object as PropType<Theme>,
      required: true
    }
  },
  emits: {
    changeTheme: (_theme: Theme) => true
  },
  setup(props, { emit }) {
    const { editedTheme, updateEditedTheme, isChanged, applyTheme } =
      useEditedThemes(props, emit)

    const { isImporterOpen, onImportClick } = useImporter()

    return {
      applyTheme,
      editedTheme,
      isChanged,
      isImporterOpen,
      onImportClick,
      updateEditedTheme
    }
  }
})
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
