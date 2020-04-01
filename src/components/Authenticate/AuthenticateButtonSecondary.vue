<template>
  <button
    :class="$style.container"
    :style="styles.container"
    @click="context.emit('click')"
  >
    <icon
      v-if="props.iconName"
      :class="$style.icon"
      :name="props.iconName"
      :mdi="props.iconMdi"
    />
    {{ props.label }}
  </button>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

type Props = {
  label: string
  iconName?: string
  iconMdi: boolean
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      borderColor: theme.ui.secondary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'AuthenticateButtonPrimary',
  components: {
    Icon
  },
  props: {
    label: { type: String, default: '' },
    iconName: { type: String, required: false },
    iconMdi: { type: Boolean, default: false }
  },
  setup(props: Props, context: SetupContext) {
    const styles = useStyles()
    return { props, context, styles }
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
