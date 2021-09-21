<template>
  <section :class="$style.container">
    <profile-tab
      v-if="currentNavigation === 'profile'"
      :user="user"
      :detail="detail"
      :class="$style.content"
    />
    <groups-tab
      v-if="currentNavigation === 'groups'"
      :detail="detail"
      :class="$style.content"
    />
    <tags-tab
      v-if="currentNavigation === 'tags'"
      :detail="detail"
      :class="$style.content"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { User, UserDetail } from '@traptitech/traq'
import { NavigationItemType } from './use/navigation'
import ProfileTab from './ProfileTab/ProfileTab.vue'
import GroupsTab from './GroupsTab.vue'
import TagsTab from './TagsTab.vue'

export default defineComponent({
  name: 'NavigationContent',
  components: {
    ProfileTab,
    GroupsTab,
    TagsTab
  },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'profile' as const
    },
    user: {
      type: Object as PropType<User>,
      required: true
    },
    detail: Object as PropType<UserDetail>
  },
  setup() {
    return {}
  }
})
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
