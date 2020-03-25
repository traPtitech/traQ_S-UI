<template>
  <div :class="$style.wrapper">
    <user-icon
      :userId="user.id"
      :preventModal="true"
      :size="iconSize"
      :class="$style.icon"
      :style="styles.icon"
    />
    <div :class="$style.content" :style="styles.content">
      <feature :user="user" />
      <navigation-selector
        @navigation-change="onNavigationChange"
        :currentNavigation="currentNavigation"
      />
      <navigation-content
        :current-navigation="currentNavigation"
        :user="user"
      />
    </div>
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
import UserIcon from '@/components/UI/UserIcon.vue'
import Feature from './Feature.vue'
import NavigationSelector from './NavigationSelector.vue'
import NavigationContent from './NavigationContent.vue'

const useStyles = (iconSize: number) =>
  reactive({
    content: makeStyles(theme => ({
      color: theme.ui.secondary,
      background: theme.background.secondary,
      borderColor: theme.background.secondary,
      paddingTop: `${iconSize / 2}px`
    })),
    icon: makeStyles(theme => ({
      marginTop: `${-iconSize / 2}px`,
      borderColor: theme.background.secondary
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
    const iconSize = 72
    const styles = useStyles(iconSize)

    const { navigationSelectorState, onNavigationChange } = useNavigation()
    const user = computed(() => store.state.entities.users[props.id])

    return {
      styles,
      iconSize,
      user,
      ...toRefs(navigationSelectorState),
      onNavigationChange
    }
  },
  components: {
    UserIcon,
    Feature,
    NavigationSelector,
    NavigationContent
  }
})
</script>

<style lang="scss" module>
.wrapper {
  position: relative;
}

.content {
  position: relative;
  display: grid;
  grid-template-columns: min-content 1fr;
  border: 4px solid;
  border-radius: 16px;
  overflow: hidden;
}

.icon {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  margin: auto;
  border: 4px solid;
}
</style>
