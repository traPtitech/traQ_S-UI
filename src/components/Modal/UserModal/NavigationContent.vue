<template>
  <section :class="$style.container">
    <profile-tab
      v-if="currentNavigation === 'profile'"
      :user="user"
      :detail="detail"
    />
    <groups-tab v-if="currentNavigation === 'groups'" :detail="detail" />
    <tags-tab v-if="currentNavigation === 'tags'" :detail="detail" />
  </section>
</template>

<script lang="ts" setup>
import ProfileTab from './ProfileTab/ProfileTab.vue'
import GroupsTab from './GroupsTab.vue'
import TagsTab from './TagsTab.vue'
import type { User, UserDetail } from '@traptitech/traq'
import type { NavigationItemType } from './composables/useNavigation'

withDefaults(
  defineProps<{
    currentNavigation?: NavigationItemType
    user: User
    detail?: UserDetail
  }>(),
  {
    currentNavigation: 'profile' as const
  }
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-primary;
  padding: 12px 16px;
  overflow: {
    x: hidden;
    y: auto;
  }
  scrollbar-gutter: stable;
}
</style>
