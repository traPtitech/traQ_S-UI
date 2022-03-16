<template>
  <div>
    <h3 :class="$style.header">メッセージ送信スタイル</h3>
    <div :class="$style.content">
      <form-radio
        v-model="sendWithModifierKeyValue"
        label="修飾キー+Enterで送信 / Enterで改行"
        input-value="modifier"
        :class="$style.sendWithModifierKey"
      />
      <form-radio
        v-model="sendWithModifierKeyValue"
        label="Enterで送信 / 修飾キー+Enterで改行"
        input-value="none"
        :class="$style.sendWithModifierKey"
      />
      <div :class="$style.key">
        <p>修飾キーとして利用するキー</p>
        <div>
          <form-checkbox
            v-model="shift"
            :label="getModifierKeyName('shift')"
            :class="$style.keyCheckbox"
          />
          <form-checkbox
            v-model="alt"
            :label="getModifierKeyName('alt')"
            :class="$style.keyCheckbox"
          />
          <form-checkbox
            v-model="ctrl"
            :label="getModifierKeyName('ctrl')"
            :class="$style.keyCheckbox"
          />
          <form-checkbox
            v-if="macFlag"
            v-model="macCtrl"
            :label="getModifierKeyName('macCtrl')"
            :class="$style.keyCheckbox"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { SendKey, SendKeys } from '/@/store/app/browserSettings'
import { isMac } from '/@/lib/dom/browser'
import { useModelSyncer, useModelObjectSyncer } from '/@/composables/useModelSyncer'

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
</script>

<script lang="ts" setup>
import FormRadio from '/@/components/UI/FormRadio.vue';
import FormCheckbox from '/@/components/UI/FormCheckbox.vue';

const props = defineProps<{
    sendWithModifierKey: SendKey,
    modifierKey: SendKeys
}>();

const emit = defineEmits<{
    (e: "update:sendWithModifierKey", _val: SendKey): void,
    (e: "update:modifierKey", _val: SendKeys): void
}>();

const sendWithModifierKeyValue = useModelSyncer(
  props,
  emit,
  'sendWithModifierKey'
)
const { shift, alt, ctrl, macCtrl } = useModelObjectSyncer(props, emit, 'modifierKey')

const macFlag = isMac()
const getModifierKeyName = (key: keyof SendKeys) => {
  return macFlag ? macModifierKeyTable[key] : windowsModifierKeyTable[key]
}
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.content {
  margin-left: 12px;
}
.sendWithModifierKey {
  display: inline-block;
  margin-right: 12px;
}
.key {
  display: flex;
  margin-top: 16px;
  flex-flow: row wrap;
  align-items: center;
  > div {
    margin-left: 24px;
  }
}
.keyCheckbox {
  margin-right: 12px;
}
</style>
