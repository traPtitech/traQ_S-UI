<template>
  <button
    :class="$style.container"
    :style="styles.container"
    @click="context.emit('click')"
  >
    <icon
      v-if="iconName"
      :class="$style.icon"
      :name="iconName"
      :mdi="iconMdi"
    />
    {{ label }}
  </button>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      borderColor: theme.ui.secondary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'AuthenticateButtonSecondary',
  components: {
    Icon
  },
  props: {
    label: { type: String, default: '' },
    iconName: String,
    iconMdi: { type: Boolean, default: false }
  },
  setup(props, context: SetupContext) {
    const styles = useStyles()
    return { context, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 12px;
  border: {
    style: solid;
    width: 2px;
    radius: 4px;
  }
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.icon {
  margin-right: 12px;
}
</style>
