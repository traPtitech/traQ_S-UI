<template>
  <div :class="$style.container" :style="styles.container" :disabled="disabled">
    <icon
      :class="$style.icon"
      :name="iconName"
      :mdi="iconMdi"
      :width="24"
      :height="24"
    />
    <span :class="$style.label">{{ label }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelViewHeaderToolsMenuItem',
  components: {
    Icon
  },
  props: {
    iconName: { type: String, required: true },
    iconMdi: { type: Boolean, default: false },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
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
  cursor: pointer;
  &[disabled] {
    opacity: 0.5;
    cursor: pointer;
  }
}
.icon {
  flex-shrink: 0;
  margin-right: 12px;
}
.label {
  font: {
    size: 1rem;
  }
}
</style>
