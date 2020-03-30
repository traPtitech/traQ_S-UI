<template>
  <section :class="$style.container" :style="styles.container">
    <navigation-content-title :current-navigation="props.currentNavigation" />
    <profile-tab
      v-if="props.currentNavigation === 'profile'"
      :class="$style.content"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import apis from '@/lib/api'
import { User, UserDetail } from '@traptitech/traq'
import { UserId } from '@/types/entity-ids'
import { NavigationItemType } from './use/navigation'
import NavigationContentTitle from './NavigationContentTitle.vue'
import ProfileTab from './ProfileTab.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    }))
  })

type Props = {
  currentNavigation: NavigationItemType
}

export default defineComponent({
  name: 'NavigationContent',
  components: {
    NavigationContentTitle,
    ProfileTab
  },
  props: {
    currentNavigation: {
      type: String,
      default: 'profile' as NavigationItemType
    }
  },
  setup(props: Props) {
    const styles = useStyles()

    return {
      styles,
      props
    }
  }
})
</script>

<style lang="scss" module>
.container {
  flex: 1 1;
}
</style>
