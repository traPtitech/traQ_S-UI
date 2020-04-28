<template>
  <div :class="$style.container" :style="containerStyle">
    {{ name }}
    <div :class="$style.line"></div>
    <icon
      name="rounded-triangle"
      :class="$style.icon"
      :style="iconStyle"
      size="20"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'UsersSeparator',
  components: {
    Icon
  },
  props: {
    name: { type: String, default: '' },
    isOpen: { type: Boolean, default: false }
  },
  setup(props) {
    return {
      containerStyle: makeStyles(theme => ({
        borderColor: theme.ui.tertiary,
        color: theme.ui.secondary
      })),
      iconStyle: makeStyles(theme => ({
        color: theme.ui.tertiary,
        transform: props.isOpen ? `rotate(0.5turn)` : `rotate(0turn)`
      }))
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  justify-content: space-between;
  font-weight: bold;
}
.line {
  margin: 0 8px;
  width: 100%;
  border-bottom: {
    style: solid;
    width: 2px;
    color: inherit;
  }
}
.icon {
  transition: transform 0.1s cubic-bezier(1, 0, 0, 1);
  flex-shrink: 0;
}
</style>
