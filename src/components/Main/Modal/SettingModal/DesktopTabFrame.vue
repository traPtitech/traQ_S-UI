<template>
  <section :class="$style.container" :style="styles.container">
    <tab-content-title
      :current-navigation="currentNavigation"
      :class="$style.title"
    />
    <tab-content
      :current-navigation="currentNavigation"
      may-show-safari-warning
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { NavigationItemType } from './use/navigation'
import TabContentTitle from './TabContentTitle.vue'
import TabContent from './TabContent.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'DesktopTabFrame',
  components: {
    TabContentTitle,
    TabContent
  },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'profile' as const
    }
  },
  setup() {
    const styles = useStyles()

    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  flex: 1 1;
  padding: 40px;
  padding-right: 240px;
  overflow: {
    x: hidden;
    y: auto;
  }
}

.title {
  margin-bottom: 40px;
}
</style>
