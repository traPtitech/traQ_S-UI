<template>
  <section :class="$style.container" :style="styles.container">
    <navigation-selector-item
      v-for="item in items"
      :key="item.type"
      :icon-name="item.iconName"
      :icon-mdi="item.iconMdi"
      :is-selected="currentNavigation === item.type"
      @click.native="onNavigationItemClick(item.type)"
    />
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  reactive,
  PropType
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { NavigationItemType, useNavigationSelectorItem } from './use/navigation'
import NavigationSelectorItem from '@/components/Main/Modal/UserModal/NavigationSelectorItem.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'NavigationSelector',
  components: { NavigationSelectorItem },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'profile' as const
    }
  },
  setup(props, context: SetupContext) {
    const styles = useStyles()
    const items: {
      type: NavigationItemType
      iconName: string
      iconMdi?: true
    }[] = [
      {
        type: 'profile',
        iconName: 'user'
      },
      {
        type: 'groups',
        iconName: 'group'
      },
      {
        type: 'tags',
        iconName: 'tags',
        iconMdi: true
      }
    ]
    const { onNavigationItemClick } = useNavigationSelectorItem(context)
    return {
      styles,
      items,
      onNavigationItemClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  margin-right: 4px;
  padding-top: 8px;
}
</style>
