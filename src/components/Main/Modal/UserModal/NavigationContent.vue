<template>
  <div :class="$style.container">
    <profile-tab
      v-if="props.currentNavigation === 'profile'"
      :user="props.user"
      :class="$style.content"
    />
    <groups-tab
      v-if="props.currentNavigation === 'groups'"
      :class="$style.content"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { NavigationItemType } from './use/navigation'
import ProfileTab from './ProfileTab.vue'
import GroupsTab from './GroupsTab.vue'
import { User } from '@/lib/api'

type Props = {
  currentNavigation: NavigationItemType
  user: User
}

export default defineComponent({
  name: 'NavigationContent',
  components: {
    ProfileTab,
    GroupsTab
  },
  props: {
    currentNavigation: {
      type: String,
      default: 'home' as NavigationItemType
    },
    user: {
      type: Object,
      required: true
    }
  },
  setup(props: Props) {
    return { props }
  }
})
</script>

<style lang="scss" module>
.container {
}
.content {
}
</style>
