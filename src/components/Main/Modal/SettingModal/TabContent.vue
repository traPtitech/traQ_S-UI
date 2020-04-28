<template>
  <div>
    <profile-tab v-if="currentNavigation === 'profile'" />
    <browser-tab v-else-if="currentNavigation === 'browser'" />
    <qall-tab v-else-if="currentNavigation === 'qall'" />
    <stamp-tab v-else-if="currentNavigation === 'stamp'" />
    <theme-tab v-else-if="currentNavigation === 'theme'" />
    <safari-warning v-if="mayShowSafariWarning" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { NavigationItemType } from './use/navigation'
import ProfileTab from './ProfileTab/ProfileTab.vue'
import BrowserTab from './BrowserTab/BrowserTab.vue'
import QallTab from './QallTab/QallTab.vue'
import StampTab from './StampTab/StampTab.vue'
import ThemeTab from './ThemeTab/ThemeTab.vue'
import SafariWarning from './SafariWarning.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'TabContent',
  components: {
    ProfileTab,
    BrowserTab,
    QallTab,
    StampTab,
    ThemeTab,
    SafariWarning
  },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'profile' as const
    },
    mayShowSafariWarning: {
      type: Boolean,
      default: false
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
</style>
