<template>
  <section :class="$style.container" :style="styles.container">
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
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, watch } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import apis from '@/lib/api'
import { User, UserDetail } from '@traptitech/traq'
import { UserId } from '@/types/entity-ids'
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
    const styles = useStyles()

    const detail = computed(
      () => store.state.ui.modal.userDetails[props.user.id]
    )
    store.dispatch.ui.modal.fetchUserDetail(props.user.id)

    return {
      styles,
      props,
      detail
    }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 8px 16px;
  overflow: hidden;
}
</style>
