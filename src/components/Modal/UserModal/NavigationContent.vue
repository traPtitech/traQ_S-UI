<template>
  <section :class="$style.container">
    <ProfileTab
      v-if="currentNavigation === 'profile'"
      :user="user"
      :detail="detail"
    />
    <GroupsTab v-if="currentNavigation === 'groups'" :detail="detail" />
    <TagsTab v-if="currentNavigation === 'tags'" :detail="detail" />
  </section>
</template>

<script lang="ts" setup>
import ProfileTab from './ProfileTab/ProfileTab.vue'
import GroupsTab from './GroupsTab.vue'
import TagsTab from './TagsTab.vue'
import type { User, UserDetail } from '@traptitech/traq'
import type { UserModalNavigationItemType } from '/@/store/ui/modal/states'

withDefaults(
  defineProps<{
    currentNavigation?: UserModalNavigationItemType
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
