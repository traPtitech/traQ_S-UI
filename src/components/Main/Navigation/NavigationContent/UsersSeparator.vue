<template>
  <div :class="$style.container" :style="containerStyle">
    {{ props.name }}
    <div :class="$style.line"></div>
    <icon
      name="rounded-triangle"
      :color="iconColor"
      :class="$style.icon"
      :style="iconStyle"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

type Props = { name: string; isOpen: boolean }

export default defineComponent({
  name: 'UsersSeparator',
  components: {
    Icon
  },
  props: {
    name: { type: String, default: '' },
    isOpen: { type: Boolean, default: false }
  },
  setup(props: Props) {
    return {
      props,
      containerStyle: makeStyles(theme => ({
        borderColor: theme.ui.tertiary,
        color: theme.ui.secondary
      })),
      iconColor: computed(() => store.state.app.theme.ui.tertiary),
      iconStyle: makeStyles(theme => ({
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
}
</style>
