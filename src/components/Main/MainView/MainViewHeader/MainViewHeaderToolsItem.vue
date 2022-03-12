<template>
  <div
    :class="$style.container"
    :data-is-disabled="$boolAttr(disabled)"
    :data-header-style="headerStyle"
    :title="tooltip"
    @click="onClick"
  >
    <a-icon :mdi="iconMdi" :name="iconName" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { useMainViewStore } from '/@/store/ui/mainView'

export default defineComponent({
  name: 'MainViewHeaderToolsItem',
  components: {
    AIcon
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
    const { headerStyle } = useMainViewStore()
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
    @include color-ui-primary-inactive;
    cursor: not-allowed;
  }
  &[data-header-style='dark'] {
    @include color-common-text-white-primary;
  }
}
</style>
