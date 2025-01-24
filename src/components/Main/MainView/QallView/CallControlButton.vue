<script setup lang="ts">
import { defineProps, computed, useCssModule } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

const props = defineProps({
  icon: {
    type: String,
    default: ''
  },
  onClick: {
    type: Function,
    default: null
  },
  isOn: {
    type: Boolean,
    required: true
  },
  inverted: {
    type: Boolean,
    default: false
  },
  mdi: {
    type: Boolean,
    default: true
  }
})

const style = useCssModule()

const buttonClass = computed(() => ({
  [style.callControlButton]: true,
  [style.on]: props.isOn,
  [style.off]: !props.isOn
}))

const iconClass = computed(() => ({
  [style.icon]: true,
  [style.inverted]: props.inverted
}))

function handleClick() {
  props.onClick?.()
}
</script>

<template>
  <button :class="buttonClass" @click="handleClick">
    <AIcon v-if="icon" :name="icon" :mdi="mdi" :size="32" :class="iconClass" />
  </button>
</template>

<style lang="scss" module>
.callControlButton {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.callControlButton.on {
  background-color: white;
}

.callControlButton.off {
  background-color: #49535b;
}

.callControlButton:hover {
  opacity: 0.85;
}

.icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inverted {
  filter: invert(1);
}
</style>
