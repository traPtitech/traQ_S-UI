<template>
  <div :class="$style.container">
    <div :class="$style.icon" :style="styles.icon">
      <icon
        :name="iconName"
        :mdi="iconMdi"
        :disabled="disabled"
        :width="24"
        :height="24"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    icon: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'Tool',
  components: { Icon },
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
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 100vw;
  cursor: pointer;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
}
.icon {
  width: 24px;
  height: 24px;
}
</style>
