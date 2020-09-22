<template>
  <button
    :class="$style.container"
    :title="title"
    @click="$emit('click')"
    :aria-pressed="value"
  >
    <Icon :size="22" :class="$style.icon" :name="iconName" :mdi="iconMdi" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'ToggleButton',
  props: {
    iconName: {
      type: String,
      required: true
    },
    iconMdi: {
      type: Boolean,
      default: false
    },
    value: {
      type: Boolean,
      default: false
    },
    title: String
  },
  setup() {
    return {}
  },
  components: {
    Icon
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  padding: 4px 32px;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
}

.icon {
  @include color-ui-secondary;
  vertical-align: middle;
  opacity: 0.5;
  .container[aria-pressed='true'] & {
    @include color-accent-primary;
    opacity: 1;
  }
}
</style>
