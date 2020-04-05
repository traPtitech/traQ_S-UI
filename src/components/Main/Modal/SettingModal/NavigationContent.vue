<template>
  <section :class="$style.container" :style="styles.container">
    <navigation-content-title :current-navigation="currentNavigation" />
    <profile-tab v-if="currentNavigation === 'profile'" />
    <browser-tab v-else-if="currentNavigation === 'browser'" />
    <qall-tab v-else-if="currentNavigation === 'qall'" />
    <stamp-tab v-else-if="currentNavigation === 'stamp'" />
    <theme-tab v-else-if="currentNavigation === 'theme'" />
    <section v-if="safariFlag">
      Safariを利用していてかつ、アプリまたはPWAをインストールをしていない場合は、
      7日間の使用がなかった際にここの設定情報が消えることがあります。 詳細は
      <a
        href="https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/"
      >
        Webkitの公式ブログの記事
      </a>
      をご覧ください。
    </section>
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
import { isSafari } from '@/lib/util/browser'
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

    const safariFlag = isSafari()

    return { styles, safariFlag }
  }
})
</script>

<style lang="scss" module>
.container {
  flex: 1 1;
}
</style>
