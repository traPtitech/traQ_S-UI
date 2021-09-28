<template>
  <div
    :class="$style.container"
    :data-is-disabled="$boolAttr(disabled)"
    :data-header-style="headerStyle"
    :title="tooltip"
    @click="onClick"
  >
    <icon :class="$style.icon" :mdi="iconMdi" :name="iconName" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useHeaderStyle from '/@/components/Main/MainView/MainViewHeader/use/headerStyle'
import Icon from '/@/components/UI/Icon.vue'

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
    },
    tooltip: {
      type: String,
      default: undefined
    }
  },
  emits: {
    click: () => true
  },
  setup(props, { emit }) {
    const { headerStyle } = useHeaderStyle()
    const onClick = () => {
      if (props.disabled) return
      emit('click')
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
