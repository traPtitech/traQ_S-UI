<template>
  <button :class="$style.button" :style="styles.button">
    <icon
      :name="iconName"
      :mdi="iconMdi"
      :size="isMobile ? 20 : 24"
      :class="$style.icon"
      :style="styles.icon"
    />
    {{ title }}
  </button>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import useIsMobile from '@/use/isMobile'

const useStyles = () =>
  reactive({
    button: makeStyles(theme => ({
      color: theme.ui.secondary,
      background: theme.background.primary
    })),
    icon: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

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
  setup() {
    const styles = useStyles()
    const { isMobile } = useIsMobile()
    return { styles, isMobile }
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
  display: inline-flex;
  align-items: center;
}

.icon {
  vertical-align: bottom;
}
</style>
