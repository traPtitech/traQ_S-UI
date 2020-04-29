<template>
  <div
    :class="$style.container"
    :style="styles.container"
    @click="onClick"
    :data-is-disabled="disabled"
  >
    <icon :class="$style.icon" :mdi="iconMdi" :name="iconName" />
  </div>
</template>

<script lang="ts">
import { reactive, defineComponent } from '@vue/composition-api'
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
    const { stylesWithColor } = useHeaderStyle()
    const styles = reactive({
      container: stylesWithColor({})
    })
    const onClick = () => {
      if (props.disabled) return
      context.emit('click')
    }
    return { onClick, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 8px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  &[data-is-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
