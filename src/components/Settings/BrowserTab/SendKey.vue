<template>
  <div :class="$style.container">
    <h3>メッセージ送信スタイル</h3>
    <div
      :data-is-selected="sendWithModifierKeyValue === 'modifier'"
      :class="$style.radio"
    >
      <form-radio
        v-model="sendWithModifierKeyValue"
        label="修飾キー+Enterで送信 / Enterで改行"
        input-value="modifier"
      />
    </div>
    <div
      :data-is-selected="sendWithModifierKeyValue === 'none'"
      :class="$style.radio"
    >
      <form-radio
        v-model="sendWithModifierKeyValue"
        label="Enterで送信 / 修飾キー+Enterで改行"
        input-value="none"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SendKey } from '/@/store/app/browserSettings'
import { useModelSyncer } from '/@/composables/useModelSyncer'
import FormRadio from '/@/components/UI/FormRadio.vue'

const props = defineProps<{
  sendWithModifierKey: SendKey
}>()

const emit = defineEmits<{
  (e: 'update:sendWithModifierKey', _val: SendKey): void
}>()

const sendWithModifierKeyValue = useModelSyncer(
  props,
  emit,
  'sendWithModifierKey'
)
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.radio {
  font-weight: bold;
  &[data-is-selected='false'] {
    opacity: 0.5;
  }
}
</style>
