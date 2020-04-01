<template>
  <button :class="$style.button" :style="styles.button">
    <icon
      :name="props.iconName"
      :mdi="props.iconMdi"
      :class="$style.icon"
      :style="styles.icon"
    />
    {{ props.title }}
  </button>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    button: makeStyles(theme => ({
      color: theme.ui.secondary,
      background: '#ffffff'
    })),
    icon: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

type Props = {
  title?: string
  iconName: string
  iconMdi: boolean
}

export default defineComponent({
  name: 'LinkButton',
  props: {
    title: {
      type: String,
      default: ''
    },
    iconName: {
      type: String,
      required: true
    },
    iconMdi: {
      type: Boolean,
      required: true
    }
  },
  setup(props: Props) {
    const styles = useStyles()

    return {
      styles,
      props
    }
  },
  components: {
    Icon
  }
})
</script>

<style lang="scss" module>
.button {
  padding: 4px 12px;
  margin: 8px 4px;
  border-radius: 1em;
  cursor: pointer;
}

.icon {
  vertical-align: bottom;
}
</style>
