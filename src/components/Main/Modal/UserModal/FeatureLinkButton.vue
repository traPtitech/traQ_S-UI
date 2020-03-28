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

interface Props {
  title: string
  iconName: string
  iconMdi: boolean
}

export default defineComponent({
  name: 'FeatureLinkButton',
  props: {
    title: {
      type: String,
      required: true
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
  padding: 4px 8px;
  margin: 8px 4px;
  border-radius: 1em;
  cursor: pointer;
}

.icon {
  vertical-align: bottom;
}
</style>
