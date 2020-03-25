<template>
  <section :class="$style.container" :style="styles.container">
    <div
      v-for="item in items"
      :key="item.type"
      @click="onNavigationItemClick(item.type)"
      :style="{ display: 'content' }"
    >
      <navigation-selector-item
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
import NavigationSelectorItem from '@/components/Main/Modal/UserModal/NavigationSelectorItem.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary
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
        iconName: 'user'
      },
      {
        type: 'groups',
        iconName: 'user'
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
      props,
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

.item {
  box-sizing: content-box;
  height: 24px;
  width: 24px;
  padding: 4px;
  border-left: 4px solid transparent;
}
</style>
