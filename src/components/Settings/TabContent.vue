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
import { computed, defineComponent, PropType } from 'vue'
import { NavigationItemType } from './use/navigation'
import ProfileTab from '../../views/Settings/ProfileTab.vue'
import BrowserTab from '../../views/Settings/BrowserTab.vue'
import QallTab from '../../views/Settings/QallTab.vue'
import StampTab from '../../views/Settings/StampTab.vue'
import ThemeTab from '../../views/Settings/ThemeTab.vue'
import SafariWarning from './SafariWarning.vue'
import useIsMobile from '@/use/isMobile'

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
    }
  },
  setup() {
    const { isMobile } = useIsMobile()
    const mayShowSafariWarning = computed(() => !isMobile.value)
    return { mayShowSafariWarning }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-primary;
  flex: 1 1;
  padding: 40px;
  padding-right: 240px;
  overflow: {
    x: hidden;
    y: auto;
  }
}
</style>
