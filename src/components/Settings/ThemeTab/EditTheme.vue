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
      @click="openSettingsThemeEditModal"
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

<script lang="ts" setup>
import FormButton from '/@/components/UI/FormButton.vue'
import { useModalStore } from '/@/store/ui/modal'

const { pushModal } = useModalStore()

const openSettingsThemeEditModal = () =>
  pushModal({ type: 'settings-theme-edit' })
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
