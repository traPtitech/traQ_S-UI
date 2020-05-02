<template>
  <button :class="$style.container" @click="context.emit('click')">
    <icon
      v-if="iconName"
      :class="$style.icon"
      :name="iconName"
      :mdi="iconMdi"
    />
    {{ label }}
  </button>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'AuthenticateButtonSecondary',
  components: {
    Icon
  },
  props: {
    label: { type: String, default: '' },
    iconName: String,
    iconMdi: { type: Boolean, default: false }
  },
  setup(props, context: SetupContext) {
    return { context }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 12px;
  border: {
    style: solid;
    width: 2px;
    radius: 4px;
    color: $theme-ui-secondary;
  }
  color: $theme-ui-secondary;
  background: $theme-background-primary;
  font-weight: bold;
  display: flex;
  align-items: center;
  cursor: pointer;
  &[disabled] {
    cursor: not-allowed;
  }
}
.icon {
  margin-right: 12px;
}
</style>
