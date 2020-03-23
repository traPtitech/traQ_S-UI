<template>
  <div :class="$style.modal">
    <feature :user="user" />
    <navigation-selector
      @navigation-change="onNavigationChange"
      :currentNavigation="currentNavigation"
    />
    <navigation-content :current-navigation="currentNavigation" :user="user" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  toRefs
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { UserId } from '@/types/entity-ids'
import { useNavigation } from './use/navigation'
import Feature from './Feature.vue'
import NavigationSelector from './NavigationSelector.vue'
import NavigationContent from './NavigationContent.vue'

const useStyles = () =>
  reactive({
    modal: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    }))
  })

interface Props {
  id: UserId
}

export default defineComponent({
  name: 'UserModal',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    const styles = useStyles()
    const { navigationSelectorState, onNavigationChange } = useNavigation()
    const user = computed(() => store.state.entities.users[props.id])

    return {
      styles,
      user,
      ...toRefs(navigationSelectorState),
      onNavigationChange
    }
  },
  components: {
    Feature,
    NavigationSelector,
    NavigationContent
  }
})
</script>

<style lang="scss" module>
.modal {
}
</style>
