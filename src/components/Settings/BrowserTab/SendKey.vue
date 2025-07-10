<template>
  <div :class="$style.container">
    <h3>メッセージ送信スタイル</h3>
    <div
      :data-is-selected="sendWithModifierKeyValue === 'modifier'"
      :class="$style.radio"
    >
      <form-radio
        v-model="sendWithModifierKeyString"
        label="修飾キー+Enterで送信 / Enterで改行"
        input-value="modifier"
      />
    </div>
    <div
      :data-is-selected="sendWithModifierKeyValue === 'none'"
      :class="$style.radio"
    >
      <form-radio
        v-model="sendWithModifierKeyString"
        label="Enterで送信 / 修飾キー+Enterで改行"
        input-value="none"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import FormRadio from '/@/components/UI/FormRadio.vue'
import { isSendKey, type SendKey } from '/@/store/app/browserSettings'

const sendWithModifierKeyValue = defineModel<SendKey>('sendWithModifierKey', {
  required: true
})

const sendWithModifierKeyString = computed<string>({
  get: () => sendWithModifierKeyValue.value,
  set: newValue => {
    if (isSendKey(newValue)) {
      sendWithModifierKeyValue.value = newValue
    }
  }
})
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
