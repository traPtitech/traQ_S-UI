<template>
  <div :class="$style.container">
    <navigation-content-title :current-navigation="currentNavigation" />
    <home-tab v-if="currentNavigation === 'home'" :class="$style.content" />
    <channels-tab
      v-if="currentNavigation === 'channels'"
      :class="$style.content"
    />
    <!-- アクティビティの内容は保持しておきたいため -->
    <keep-alive>
      <activity-tab
        v-if="currentNavigation === 'activity'"
        :class="$style.content"
      />
    </keep-alive>
    <users-tab v-if="currentNavigation === 'users'" :class="$style.content" />
    <clip-folders-tab
      v-if="currentNavigation === 'clips'"
      :class="$style.content"
    />
  </div>
</template>

<script lang="ts" setup>
import NavigationContentTitle from './NavigationContentTitle.vue'
import HomeTab from './NavigationContent/HomeTab.vue'
import ChannelsTab from './NavigationContent/ChannelsTab.vue'
import ActivityTab from './NavigationContent/ActivityTab.vue'
import UsersTab from './NavigationContent/UsersTab.vue'
import ClipFoldersTab from './NavigationContent/ClipFoldersTab.vue'
import { NavigationItemType } from '/@/components/Main/NavigationBar/composables/useNavigationConstructor'

withDefaults(
  defineProps<{
    currentNavigation?: NavigationItemType
  }>(),
  {
    currentNavigation: 'home' as const
  }
)
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
