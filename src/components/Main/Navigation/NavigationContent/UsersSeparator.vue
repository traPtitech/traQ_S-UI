<template>
  <div :class="$style.container" :style="containerStyle">
    {{ props.name }}
    <div :class="$style.line"></div>
    <icon name="rounded-triangle" :color="iconColor" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

type Props = { name: string }

export default defineComponent({
  name: 'UsersSeparator',
  components: {
    Icon
  },
  props: { name: { type: String, default: '' } },
  setup(props: Props) {
    return {
      props,
      containerStyle: makeStyles(theme => ({
        borderColor: theme.ui.tertiary,
        color: theme.ui.secondary
      })),
      iconColor: computed(() => store.state.app.theme.ui.tertiary)
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
}
.line {
  content: '';
  display: block;
  margin-left: 8px;
  margin-right: 8px;
  width: 100%;
  border-bottom: {
    style: solid;
    width: 2px;
    color: inherit;
  }
}
</style>
