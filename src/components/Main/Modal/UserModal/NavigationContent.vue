<template>
  <section :class="$style.container" :style="styles.container">
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
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { User, UserDetail } from '@traptitech/traq'
import { NavigationItemType } from './use/navigation'
import ProfileTab from './ProfileTab/ProfileTab.vue'
import GroupsTab from './GroupsTab.vue'
import TagsTab from './TagsTab.vue'

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
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 12px 16px;
  overflow: hidden;
}
</style>
