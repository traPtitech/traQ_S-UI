<template>
  <div>
    <h3 :class="$style.header">メッセージ送信スタイル</h3>
    <div :class="$style.content">
      <form-radio
        label="修飾キー+Enterで送信 / Enterで改行"
        input-value="modifier"
        v-model="sendWithModifierKeyValue"
        :class="$style.sendWithModifierKey"
      />
      <form-radio
        label="Enterで送信 / 修飾キー+Enterで改行"
        input-value="none"
        v-model="sendWithModifierKeyValue"
        :class="$style.sendWithModifierKey"
      />
      <div :class="$style.key">
        <p>修飾キーとして利用するキー</p>
        <div>
          <form-checkbox
            :label="getModifierKeyName('shift')"
            v-model="shift"
            :class="$style.keyCheckbox"
          />
          <form-checkbox
            :label="getModifierKeyName('alt')"
            v-model="alt"
            :class="$style.keyCheckbox"
          />
          <form-checkbox
            :label="getModifierKeyName('ctrl')"
            v-model="ctrl"
            :class="$style.keyCheckbox"
          />
          <form-checkbox
            v-if="macFlag"
            :label="getModifierKeyName('macCtrl')"
            v-model="macCtrl"
            :class="$style.keyCheckbox"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { SendKey, SendKeys } from '@/store/app/browserSettings'
import { isMac } from '@/lib/util/browser'
import FormRadio from '@/components/UI/FormRadio.vue'
import FormCheckbox from '@/components/UI/FormCheckbox.vue'
import { useModelSyncer, useModelObjectSyncer } from '@/use/modelSyncer'

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

export default defineComponent({
  name: 'SendKey',
  components: {
    FormRadio,
    FormCheckbox
  },
  props: {
    sendWithModifierKey: {
      type: String as PropType<SendKey>,
      required: true
    },
    modifierKey: {
      type: Object as PropType<SendKeys>,
      required: true
    }
  },
  setup(props, { emit }) {
    const sendWithModifierKeyValue = useModelSyncer(
      props,
      emit,
      'sendWithModifierKey'
    )
    const modifierKeyValue = useModelObjectSyncer(props, emit, 'modifierKey')

    const macFlag = isMac()
    const getModifierKeyName = (key: keyof SendKeys) => {
      return macFlag ? macModifierKeyTable[key] : windowsModifierKeyTable[key]
    }

    return {
      sendWithModifierKeyValue,
      ...modifierKeyValue,
      macFlag,
      getModifierKeyName
    }
  }
})
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
