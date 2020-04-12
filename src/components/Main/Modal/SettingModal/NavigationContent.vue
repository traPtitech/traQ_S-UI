<template>
  <section :class="$style.container" :style="styles.container">
    <navigation-content-title :current-navigation="currentNavigation" />
    <profile-tab v-if="currentNavigation === 'profile'" />
    <browser-tab v-else-if="currentNavigation === 'browser'" />
    <qall-tab v-else-if="currentNavigation === 'qall'" />
    <stamp-tab v-else-if="currentNavigation === 'stamp'" />
    <theme-tab v-else-if="currentNavigation === 'theme'" />
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  computed,
  PropType
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import apis from '@/lib/api'
import { User, UserDetail } from '@traptitech/traq'
import { UserId } from '@/types/entity-ids'
import { NavigationItemType } from './use/navigation'
import NavigationContentTitle from './NavigationContentTitle.vue'
import ProfileTab from './ProfileTab/ProfileTab.vue'
import BrowserTab from './BrowserTab/BrowserTab.vue'
import QallTab from './QallTab/QallTab.vue'
import StampTab from './StampTab/StampTab.vue'
import ThemeTab from './ThemeTab/ThemeTab.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'NavigationContent',
  components: {
    NavigationContentTitle,
    ProfileTab,
    BrowserTab,
    QallTab,
    StampTab,
    ThemeTab
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
}
</style>
