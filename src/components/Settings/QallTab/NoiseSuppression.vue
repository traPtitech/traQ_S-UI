<template>
  <section>
    <h3 :class="$style.heading">ノイズ抑制</h3>
    <template v-if="isAudioWorkletSupported">
      <form-radio
        :model-value="noiseSuppressionValue"
        :class="$style.input"
        label="Rnnoise"
        input-value="rnnoise"
        @update:model-value="updateNoiseSuppressionValue"
      />
      <form-radio
        :model-value="noiseSuppressionValue"
        :class="$style.input"
        label="Speex"
        input-value="speex"
        @update:model-value="updateNoiseSuppressionValue"
      />
      <form-radio
        :model-value="noiseSuppressionValue"
        :class="$style.input"
        label="無効"
        input-value="none"
        @update:model-value="updateNoiseSuppressionValue"
      />
    </template>
    <p v-else>利用している端末が対応していません。</p>
  </section>
</template>

<script lang="ts" setup>
import FormRadio from '/@/components/UI/FormRadio.vue'
import { checkAudioWorkletSupport } from '/@/lib/dom/browser'
import type { NoiseSuppressionType } from '/@/lib/webrtc/LocalStreamManager'
import { isNoiseSuppressionType } from '/@/lib/webrtc/LocalStreamManager'

const noiseSuppressionValue = defineModel<NoiseSuppressionType>({
  required: true
})

const updateNoiseSuppressionValue = (val: string) => {
  if (!isNoiseSuppressionType(val)) return
  noiseSuppressionValue.value = val
}

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
