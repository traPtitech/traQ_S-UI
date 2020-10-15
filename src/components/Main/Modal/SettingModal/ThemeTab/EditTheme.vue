<template>
  <div :class="$style.content">
    <!--
    <form-button
      label="エクスポート"
      @click="onImportClick"
      :disabled="isUpdated"
      color="secondaly"
      :class="$style.element"
    />
    -->
    <form-button
      label="インポート/エクスポート"
      @click="onImportClick"
      :disabled="isUpdated"
      color="secondaly"
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
  <template v-if="isUpdated">
    <textarea-autosize
      @input="val => (editedTheme = val.target.value)"
      :value="editedTheme"
      :class="$style.jsonarea"
    />
    <div :class="$style.updater">
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
import { lightTheme } from '@/store/app/themeSettings/default'

const hasKeyTheme = (theme: Theme): boolean => {
  const keys = ['accent', 'background', 'text', 'ui']
  const keysAccent = ['error', 'focus', 'notification', 'online', 'primary']
  const keysBackground = ['primary', 'secondary', 'secondarySub', 'tertiary']
  const keysUi = ['primary', 'secondary', 'tertiary']
  const keysText = ['primary', 'secondary']
  if (Object.keys(theme).sort().toString() !== keys.toString()) {
    return false
  }
  if (Object.keys(theme.accent).sort().toString() !== keysAccent.toString()) {
    return false
  }
  if (
    Object.keys(theme.background).sort().toString() !==
    keysBackground.toString()
  ) {
    return false
  }
  if (Object.keys(theme.ui).sort().toString() !== keysUi.toString()) {
    return false
  }
  if (Object.keys(theme.text).sort().toString() !== keysText.toString()) {
    return false
  }
  return true
}

export default defineComponent({
  name: 'EditTheme',
  props: {
    custom: {
      type: Object as PropType<Theme>,
      default: lightTheme
    }
  },
  emits: ['change-theme'],
  setup(props, context: SetupContext) {
    const isChanged = computed(
      () => editedTheme.value === JSON.stringify(props.custom, null, '\t')
    )
    const isUpdated = ref(false)
    const editedTheme = ref(JSON.stringify(props.custom, null, '\t'))
    const onImportClick = () => {
      isUpdated.value = true
    }
    const onUpdateClick = () => {
      try {
        const themeObj = JSON.parse(editedTheme.value) as Theme
        if (hasKeyTheme(themeObj)) {
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
      isUpdated
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
  float: right;
}
.element {
  margin-right: 8px;
  margin-bottom: 8px;
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
.updater {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}
</style>
