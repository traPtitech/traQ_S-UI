<template>
  <div :class="$style.container">
    <h3>修飾キーとして利用するキー</h3>
    <div :class="$style.checkbox" :data-is-checked="shift">
      <form-checkbox v-model="shift" :label="getModifierKeyName('shift')" />
    </div>
    <div :class="$style.checkbox" :data-is-checked="alt">
      <form-checkbox v-model="alt" :label="getModifierKeyName('alt')" />
    </div>
    <div :class="$style.checkbox" :data-is-checked="ctrl">
      <form-checkbox v-model="ctrl" :label="getModifierKeyName('ctrl')" />
    </div>
    <div :class="$style.checkbox" :data-is-checked="macCtrl">
      <form-checkbox
        v-if="macFlag"
        v-model="macCtrl"
        :label="getModifierKeyName('macCtrl')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SendKeys } from '/@/store/app/browserSettings'
import { isMac } from '/@/lib/dom/browser'
import { useModelObjectSyncer } from '/@/composables/useModelSyncer'
import FormCheckbox from '/@/components/UI/FormCheckbox.vue'

const props = defineProps<{
  modifierKey: SendKeys
}>()

const emit = defineEmits<{
  (e: 'update:modifierKey', _val: SendKeys): void
}>()

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

const { shift, alt, ctrl, macCtrl } = useModelObjectSyncer(
  props,
  emit,
  'modifierKey'
)

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
