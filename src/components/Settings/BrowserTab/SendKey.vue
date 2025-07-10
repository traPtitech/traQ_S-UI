<template>
  <div :class="$style.container">
    <h3>メッセージ送信スタイル</h3>
    <div
      :data-is-selected="sendWithModifierKeyValue === 'modifier'"
      :class="$style.radio"
    >
      <form-radio
        :model-value="sendWithModifierKeyValue"
        label="修飾キー+Enterで送信 / Enterで改行"
        input-value="modifier"
        @update:model-value="updateSendWithModifierKeyValue"
      />
    </div>
    <div
      :data-is-selected="sendWithModifierKeyValue === 'none'"
      :class="$style.radio"
    >
      <form-radio
        :model-value="sendWithModifierKeyValue"
        label="Enterで送信 / 修飾キー+Enterで改行"
        input-value="none"
        @update:model-value="updateSendWithModifierKeyValue"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import FormRadio from '/@/components/UI/FormRadio.vue'
import { isSendKey, type SendKey } from '/@/store/app/browserSettings'

const sendWithModifierKeyValue = defineModel<SendKey>('sendWithModifierKey', {
  required: true
})

const updateSendWithModifierKeyValue = (val: string) => {
  if (!isSendKey(val)) return
  sendWithModifierKeyValue.value = val
}
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
