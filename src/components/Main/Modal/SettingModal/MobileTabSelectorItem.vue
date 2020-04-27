<template>
  <button :class="$style.item" :style="styles.item">
    <icon
      :class="$style.icon"
      :name="iconName"
      :mdi="iconMdi"
      :width="size"
      :height="size"
    />
    {{ title }}
  </button>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  PropType
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { NavigationItemType, navigationTypeNameMap } from './use/navigation'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (size: number) =>
  reactive({
    item: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.ui.tertiary
    }))
  })

export default defineComponent({
  name: 'MobileTabSelectorItem',
  components: { Icon },
  props: {
    type: {
      type: String as PropType<NavigationItemType>,
      required: true
    },
    iconName: {
      type: String,
      required: true
    },
    iconMdi: Boolean
  },
  setup(props, context) {
    const size = 24
    const styles = useStyles(size)
    const title = computed(() => navigationTypeNameMap[props.type])
    return {
      styles,
      size,
      title,
      context
    }
  }
})
</script>

<style lang="scss" module>
.item {
  display: block;
  width: 100%;
  padding: 20px 60px 20px 80px;
  font-weight: bold;
  text-align: left;
  cursor: pointer;
}

.icon {
  margin-right: 8px;
  vertical-align: bottom;
}
</style>
