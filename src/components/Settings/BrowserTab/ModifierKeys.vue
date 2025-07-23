<template>
  <div :class="$style.container">
    <h3>修飾キーとして利用するキー</h3>
    <div :class="$style.checkbox" :data-is-checked="modelValue.shift">
      <form-checkbox v-model="modelValue.shift">
        {{ getModifierKeyName('shift') }}
      </form-checkbox>
    </div>
    <div :class="$style.checkbox" :data-is-checked="modelValue.alt">
      <form-checkbox v-model="modelValue.alt">
        {{ getModifierKeyName('alt') }}
      </form-checkbox>
    </div>
    <div :class="$style.checkbox" :data-is-checked="modelValue.ctrl">
      <form-checkbox v-model="modelValue.ctrl">
        {{ getModifierKeyName('ctrl') }}
      </form-checkbox>
    </div>
    <div :class="$style.checkbox" :data-is-checked="modelValue.macCtrl">
      <form-checkbox v-if="macFlag" v-model="modelValue.macCtrl">
        {{ getModifierKeyName('macCtrl') }}
      </form-checkbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormCheckbox from '/@/components/UI/FormCheckbox.vue'
import { isMac } from '/@/lib/dom/browser'
import type { SendKeys } from '/@/store/app/browserSettings'

const modelValue = defineModel<SendKeys>('modifierKey', { required: true })

const windowsModifierKeyTable: Record<keyof SendKeys, string> = {
  alt: 'Alt',
  ctrl: 'Ctrl',
  shift: 'Shift',
  macCtrl: ''
}
const macModifierKeyTable: Record<keyof SendKeys, string> = {
  alt: '⌥(Option)',
  ctrl: '⌘(Command)',
  shift: 'Shift',
  macCtrl: 'Ctrl'
}

const macFlag = isMac()
const getModifierKeyName = (key: keyof SendKeys) => {
  return macFlag ? macModifierKeyTable[key] : windowsModifierKeyTable[key]
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.checkbox {
  font-weight: bold;
  &[data-is-checked='false'] {
    opacity: 0.5;
  }
}
</style>
