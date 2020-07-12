<template>
  <button :class="$style.button">
    <icon
      :name="iconName"
      :mdi="iconMdi"
      :size="isMobile ? 20 : 24"
      :class="$style.icon"
    />
    {{ title }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'
import useIsMobile from '@/use/isMobile'

export default defineComponent({
  name: 'LinkButton',
  props: {
    title: {
      type: String,
      default: ''
    },
    iconName: {
      type: String,
      required: true
    },
    iconMdi: {
      type: Boolean,
      required: true
    }
  },
  setup() {
    const { isMobile } = useIsMobile()
    return { isMobile }
  },
  components: {
    Icon
  }
})
</script>

<style lang="scss" module>
.button {
  @include color-ui-secondary;
  @include background-primary;
  padding: 4px 12px;
  border-radius: 1em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.icon {
  @include color-ui-secondary;
  vertical-align: bottom;
}
</style>
