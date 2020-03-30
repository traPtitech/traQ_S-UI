<template>
  <section :class="$style.container" :style="styles.container">
    <h2 :class="$style.header">設定</h2>
    <div
      v-for="item in items"
      :key="item.type"
      @click="onNavigationItemClick(item.type)"
      :style="{ display: 'content' }"
    >
      <navigation-selector-item
        :type="item.type"
        :iconName="item.iconName"
        :iconMdi="item.iconMdi"
        :is-selected="props.currentNavigation === item.type"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { NavigationItemType, useNavigationSelectorItem } from './use/navigation'
import NavigationSelectorItem from './NavigationSelectorItem.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.secondary
    }))
  })

type Props = {
  currentNavigation: NavigationItemType
}

export default defineComponent({
  name: 'NavigationSelector',
  components: { NavigationSelectorItem },
  props: {
    currentNavigation: {
      type: String,
      default: 'profile' as NavigationItemType
    }
  },
  setup(props: Props, context: SetupContext) {
    const styles = useStyles()
    const items: {
      type: NavigationItemType
      iconName: string
      iconMdi?: true
    }[] = [
      {
        type: 'profile',
        iconName: 'account', //'user'
        iconMdi: true
      },
      {
        type: 'browser',
        iconName: 'cogs',
        iconMdi: true
      },
      {
        type: 'qall',
        iconName: 'phone',
        iconMdi: true
      },
      {
        type: 'stamp',
        iconName: 'emoticon-outline',
        iconMdi: true
      },
      {
        type: 'theme',
        iconName: 'brightness-6',
        iconMdi: true
      }
    ]
    const { onNavigationItemClick } = useNavigationSelectorItem(context)
    return {
      styles,
      props,
      items,
      onNavigationItemClick
    }
  }
})
</script>

<style lang="scss" module>
.header {
  margin: 40px 80px;
}

.item {
  box-sizing: content-box;
  height: 24px;
  width: 24px;
  padding: 4px;
  border-left: 4px solid transparent;
}
</style>
