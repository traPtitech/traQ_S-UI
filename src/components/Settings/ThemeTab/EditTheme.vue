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
      @click="onImportClick"
      :disabled="isImporterOpen"
      color="secondary"
      :class="$style.element"
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
      @update:model-value="updateEditedTheme"
      :model-value="editedTheme"
      :class="$style.jsonField"
    />
    <div :class="$style.import">
      <form-button
        label="保存"
        @click="applyTheme"
        :disabled="!isChanged"
        color="primary"
      />
    </div>
  </template>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  SetupContext,
  PropType,
  watchEffect
} from 'vue'
import FormButton from '@/components/UI/FormButton.vue'
import store from '@/store'
import { Theme } from '@/types/theme'
import { dequal } from 'dequal'
import { lightTheme } from '@/store/app/themeSettings/default'
import TextareaAutosize from '@/components/UI/TextareaAutosize.vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isValidThemeJSON = (theme: any): theme is Theme => {
  return (Object.keys(lightTheme) as Array<keyof Theme>).every(category =>
    Object.keys(lightTheme[category]).every(
      colorName =>
        theme[category] &&
        theme[category][colorName] &&
        typeof theme[category][colorName] === 'string'
    )
  )
}

const failedUpdateTheme = (text?: string) => {
  store.commit.ui.toast.addToast({
    type: 'error',
    text: 'テーマの更新に失敗しました' + (text === undefined ? '' : `: ${text}`)
  })
}

const useEditedThemes = (
  props: { custom: Theme },
  context: SetupContext<{ 'change-theme': (theme: Theme) => true }>
) => {
  const appliedThemeStringified = computed(() =>
    JSON.stringify(props.custom, null, '\t')
  )
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
  const applyTheme = () => {
    try {
      const themeObj = JSON.parse(editedTheme.value)
      if (isValidThemeJSON(themeObj)) {
        context.emit('change-theme', themeObj)
      } else {
        failedUpdateTheme('構文エラー')
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
  props: {
    custom: {
      type: Object as PropType<Theme>,
      required: true
    }
  },
  emits: {
    'change-theme': (theme: Theme) => true
  },
  setup(props, context) {
    const {
      editedTheme,
      updateEditedTheme,
      isChanged,
      applyTheme
    } = useEditedThemes(props, context)

    const { isImporterOpen, onImportClick } = useImporter()

    return {
      applyTheme,
      editedTheme,
      isChanged,
      isImporterOpen,
      onImportClick,
      updateEditedTheme
    }
  },
  components: {
    FormButton,
    TextareaAutosize
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
    border-color: $theme-accent-focus;
  }
}
.import {
  display: flex;
  justify-content: center;
  margin: 12px;
}
</style>
