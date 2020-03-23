<template>
  <div :class="$style.container">
    <profile-tab
      v-if="props.currentNavigation === 'profile'"
      :user="props.user"
      :detail="detail"
      :class="$style.content"
    />
    <groups-tab
      v-if="props.currentNavigation === 'groups'"
      :detail="detail"
      :class="$style.content"
    />
    <tags-tab
      v-if="props.currentNavigation === 'tags'"
      :detail="detail"
      :class="$style.content"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import apis, { User, UserDetail } from '@/lib/api'
import { UserId } from '@/types/entity-ids'
import { NavigationItemType } from './use/navigation'
import ProfileTab from './ProfileTab.vue'
import GroupsTab from './GroupsTab.vue'
import TagsTab from './TagsTab.vue'

const useUserDetail = (id: UserId) => {
  const detail = ref<UserDetail>()
  apis.getUser(id).then(res => {
    detail.value = res.data
  })
  return detail
}

type Props = {
  currentNavigation: NavigationItemType
  user: User
}

export default defineComponent({
  name: 'NavigationContent',
  components: {
    ProfileTab,
    GroupsTab,
    TagsTab
  },
  props: {
    currentNavigation: {
      type: String,
      default: 'profile' as NavigationItemType
    },
    user: {
      type: Object,
      required: true
    }
  },
  setup(props: Props) {
    const detail = useUserDetail(props.user.id)
    return { props, detail }
  }
})
</script>

<style lang="scss" module>
.container {
}
.content {
}
</style>
