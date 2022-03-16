<template>
  <div :class="$style.container">
    <navigation-content-title :current-navigation="currentNavigation" />
    <home-tab v-show="currentNavigation === 'home'" :class="$style.content" />
    <channels-tab
      v-show="currentNavigation === 'channels'"
      :class="$style.content"
    />
    <activity-tab
      v-show="currentNavigation === 'activity'"
      :show="currentNavigation === 'activity'"
      :class="$style.content"
    />
    <users-tab v-show="currentNavigation === 'users'" :class="$style.content" />
    <clip-folders-tab
      v-show="currentNavigation === 'clips'"
      :class="$style.content"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { NavigationItemType } from '/@/components/Main/NavigationBar/composables/useNavigationConstructor'
import NavigationContentTitle from './NavigationContentTitle.vue'
import HomeTab from './NavigationContent/HomeTab.vue'
import ChannelsTab from './NavigationContent/ChannelsTab.vue'
import ActivityTab from './NavigationContent/ActivityTab.vue'
import UsersTab from './NavigationContent/UsersTab.vue'
import ClipFoldersTab from './NavigationContent/ClipFoldersTab.vue'

export default defineComponent({
  name: 'NavigationContent',
  components: {
    NavigationContentTitle,
    HomeTab,
    ChannelsTab,
    ActivityTab,
    UsersTab,
    ClipFoldersTab
  },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'home' as const
    }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  scrollbar-gutter: stable;
  padding: {
    top: 24px;
    left: 8px;
  }
  backface-visibility: hidden;
  contain: strict;
}
.content {
  margin: 24px 0;
}
</style>
