<template>
  <section>
    <h3 :class="$style.heading">ノイズ抑制</h3>
    <template v-if="isAudioWorkletSupported">
      <form-radio
        v-model="noiseSuppressionValue"
        :class="$style.input"
        label="Rnnoise"
        input-value="rnnoise"
      />
      <form-radio
        v-model="noiseSuppressionValue"
        :class="$style.input"
        label="Speex"
        input-value="speex"
      />
      <form-radio
        v-model="noiseSuppressionValue"
        :class="$style.input"
        label="無効"
        input-value="none"
      />
    </template>
    <p v-else>利用している端末が対応していません。</p>
  </section>
</template>

<script lang="ts" setup>
import FormRadio from '/@/components/UI/FormRadio.vue'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'
import type { NoiseSuppressionType } from '/@/lib/webrtc/LocalStreamManager'
import { checkAudioWorkletSupport } from '/@/lib/dom/browser'

const props = defineProps<{
  modelValue: NoiseSuppressionType
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', _val: NoiseSuppressionType): void
}>()

const noiseSuppressionValue = useModelValueSyncer(props, emit)

const isAudioWorkletSupported = checkAudioWorkletSupport()
</script>

<style lang="scss" module>
.heading {
  margin-bottom: 4px;
}
.input {
  display: block;
  font-weight: bold;
  margin-right: 8px;
}
</style>
