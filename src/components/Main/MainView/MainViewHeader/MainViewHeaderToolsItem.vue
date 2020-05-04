<template>
  <div
    :class="$style.container"
    @click="onClick"
    :data-is-disabled="disabled"
    :data-header-style="headerStyle"
  >
    <icon :class="$style.icon" :mdi="iconMdi" :name="iconName" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useHeaderStyle from '@/components/Main/MainView/MainViewHeader/use/headerStyle'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'MainViewHeaderToolsItem',
  components: {
    Icon
  },

  props: {
    iconName: {
      type: String,
      required: true
    },
    iconMdi: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const { headerStyle } = useHeaderStyle()
    const onClick = () => {
      if (props.disabled) return
      context.emit('click')
    }
    return { onClick, headerStyle }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  padding: 8px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  &[data-is-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &[data-header-style='dark'] {
    @include color-common-text-white-primary;
  }
}
</style>
