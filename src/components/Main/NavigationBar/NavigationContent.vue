<template>
  <div :class="$style.container">
    <HomeTab v-if="currentNavigation === 'home'" :class="$style.content" />
    <ChannelsTab
      v-if="currentNavigation === 'channels'"
      :class="$style.content"
    />
    <!-- アクティビティの内容は保持しておきたいため -->
    <keep-alive>
      <ActivityTab
        v-if="currentNavigation === 'activity'"
        :class="$style.content"
      />
    </keep-alive>
    <UsersTab v-if="currentNavigation === 'users'" :class="$style.content" />
    <ClipFoldersTab
      v-if="currentNavigation === 'clips'"
      :class="$style.content"
    />
  </div>
</template>

<script lang="ts" setup>
import type { NavigationItemType } from '/@/components/Main/NavigationBar/composables/useNavigationConstructor'

import ActivityTab from './NavigationContent/ActivityTab.vue'
import ChannelsTab from './NavigationContent/ChannelsTab.vue'
import ClipFoldersTab from './NavigationContent/ClipFoldersTab.vue'
import HomeTab from './NavigationContent/HomeTab.vue'
import UsersTab from './NavigationContent/UsersTab.vue'

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
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  contain: var(--contain-strict);
}
.content {
  flex: 1;
  min-height: 0;
}
</style>
