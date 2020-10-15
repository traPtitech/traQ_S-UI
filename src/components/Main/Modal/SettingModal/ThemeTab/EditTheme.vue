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
      @input="val => (editedTheme = val.target.value)"
      :value="editedTheme"
      :class="$style.jsonarea"
    />
    <div :class="$style.import">
      <form-button
        label="保存"
        @click="onUpdateClick"
        :disabled="isChanged"
        color="primary"
      />
    </div>
  </template>
</template>

<script lang="ts">
import { defineComponent, computed, ref, PropType, SetupContext } from 'vue'
import FormButton from '@/components/UI/FormButton.vue'
import { Theme } from '@/types/theme'
import { dequal } from 'dequal'
import { lightTheme } from '@/store/app/themeSettings/default'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isValidThemeJSON = (theme: any): boolean => {
  return (Object.keys(lightTheme) as Array<keyof Theme>).every(category =>
    Object.keys(lightTheme[category]).every(
      colorName =>
        theme[category] &&
        theme[category][colorName] &&
        typeof theme[category][colorName] === 'string'
    )
  )
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
  setup(props, context: SetupContext) {
    const isChanged = computed(() => {
      try {
        return dequal(JSON.parse(editedTheme.value), props.custom)
      } catch (err) {
        return false
      }
    })
    const isImporterOpen = ref(false)
    const editedTheme = ref(JSON.stringify(props.custom, null, '\t'))
    const appliedThemeStringified = computed(() =>
      JSON.stringify(props.custom, null, '\t')
    )
    const onImportClick = () => {
      isImporterOpen.value = true
    }
    const onUpdateClick = () => {
      try {
        const themeObj = JSON.parse(editedTheme.value) as Theme
        if (isValidThemeJSON(themeObj)) {
          context.emit('change-theme', themeObj)
        } else {
          editedTheme.value = JSON.stringify(props.custom, null, '\t')
          context.emit('change-theme', props.custom)
        }
      } catch (err) {
        editedTheme.value = JSON.stringify(props.custom, null, '\t')
        context.emit('change-theme', props.custom)
      }
    }

    return {
      onUpdateClick,
      onImportClick,
      editedTheme,
      isChanged,
      isImporterOpen
    }
  },
  components: {
    FormButton
  }
})
</script>

<style lang="scss" module>
.content {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}
.element {
  margin-right: 8px;
  margin-bottom: 8px;
  padding: 5px;
  align-self: flex-end;
}
.jsonarea {
  @include color-ui-primary;
  @include background-secondary;
  width: 100%;
  margin-top: 12px;
  align-items: center;
  border-radius: 4px;
  border: solid 2px transparent;
  &:focus-within {
    border-color: $theme-accent-focus;
  }
}
.import {
  display: flex;
  justify-content: center;
  margin: 12px auto;
}
</style>
