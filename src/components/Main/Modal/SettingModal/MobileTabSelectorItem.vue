<template>
  <button :class="$style.item" :style="styles.item">
    <icon :name="iconName" :mdi="iconMdi" :size="size" />
    <span :class="$style.title">{{ title }}</span>
    <icon :class="$style.chevron" name="chevron-right" mdi :size="size" />
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

const useStyles = () =>
  reactive({
    item: makeStyles(theme => ({
      color: theme.ui.secondary,
      background: theme.background.primary,
      borderColor: theme.ui.tertiary
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
  setup(props) {
    const size = 24
    const styles = useStyles()
    const title = computed(() => navigationTypeNameMap[props.type])
    return {
      styles,
      size,
      title
    }
  }
})
</script>

<style lang="scss" module>
.item {
  display: flex;
  width: 100%;
  padding: 12px 40px;
  border-top: solid 2px;
  border-bottom: solid 2px;
  font-weight: bold;
  cursor: pointer;
}
.item + .item {
  border-top: none;
}

.title {
  flex: 1 0;
  margin: 0 16px;
  text-align: left;
}

.chevron {
  margin-right: 8px;
  vertical-align: bottom;
}
</style>
