<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <h2 :class="$style.heading">
        <label v-if="isEditing" :for="inputId">名前</label>
        <template v-else>名前</template>
      </h2>
      <button
        v-if="!isEditing && canEdit"
        ref="editButtonRef"
        type="button"
        aria-label="スレッド名を変更"
        :disabled="isSaving"
        :class="$style.editButton"
        @click="emit('edit')"
      >
        <AIcon name="pencil-outline" mdi :size="20" />
      </button>
    </div>
    <template v-if="isEditing">
      <TextareaAutosize
        :id="inputId"
        ref="inputRef"
        v-model="modelValue"
        rows="1"
        :readonly="isSaving"
        :aria-invalid="errorMessage !== null"
        :aria-describedby="errorMessage !== null ? errorId : undefined"
        :class="$style.input"
      />
      <p
        v-if="errorMessage !== null"
        :id="errorId"
        role="alert"
        :class="$style.error"
      >
        {{ errorMessage }}
      </p>
      <div :class="$style.actions">
        <FormButton
          label="キャンセル"
          compact
          type="secondary"
          :disabled="isSaving"
          @click.prevent="cancel"
        />
        <FormButton
          label="保存"
          compact
          aria-label="保存"
          :loading="isSaving"
          :disabled="modelValue.length === 0"
          @click.prevent="save"
        />
      </div>
    </template>
    <bdi v-else :class="$style.value">{{ currentName }}</bdi>
    <p role="status" :class="$style.status">{{ isSaving ? '保存中…' : '' }}</p>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, useId, watch } from 'vue'

import AIcon from '/@/components/UI/AIcon.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import TextareaAutosize from '/@/components/UI/TextareaAutosize.vue'

const props = withDefaults(
  defineProps<{
    currentName: string
    isEditing: boolean
    isSaving: boolean
    errorMessage: string | null
    canEdit?: boolean
  }>(),
  { canEdit: true }
)

const modelValue = defineModel<string>({ required: true })
const emit = defineEmits<{
  edit: []
  save: [name: string]
  cancel: []
}>()

const inputId = useId()
const errorId = `${inputId}-error`
const inputRef = ref<InstanceType<typeof TextareaAutosize> | null>(null)
const editButtonRef = ref<HTMLButtonElement | null>(null)

watch(
  () => [props.isEditing, props.isSaving] as const,
  async (_, previous) => {
    await nextTick()
    if (props.isEditing && !props.isSaving) inputRef.value?.focus()
    else if (previous?.[0] && !props.isEditing) editButtonRef.value?.focus()
  },
  { immediate: true }
)

const save = () => {
  if (!props.isSaving) emit('save', modelValue.value)
}
const cancel = () => {
  if (!props.isSaving) emit('cancel')
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
}
.heading {
  @include size-body1;
  @include color-ui-secondary;
  font-weight: bold;
}
.editButton {
  @include color-ui-primary-inactive;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  min-height: 24px;
  cursor: pointer;
  &:hover {
    @include color-ui-primary;
  }
}
.editButton:focus-visible,
.actions > button:focus-visible {
  outline: 2px solid $theme-accent-focus-default;
  outline-offset: 2px;
}
.value {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.input {
  @include color-ui-primary;
  @include background-secondary;
  @include size-body1;
  width: 100%;
  padding: 4px 8px;
  border: 2px solid transparent;
  border-radius: 4px;
  &:focus {
    border-color: $theme-accent-focus-default;
  }
  &[aria-invalid='true'] {
    border-color: $theme-accent-error-default;
  }
}
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  > button {
    flex: 1 1 auto;
  }
}
.error {
  color: $theme-accent-error-default;
  overflow-wrap: anywhere;
}
.status {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
