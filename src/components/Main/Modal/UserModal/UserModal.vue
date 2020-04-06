<template>
  <div :class="$style.wrapper">
    <button :class="$style.close" @click="onClickClear">X</button>
    <user-icon
      v-if="!isMobile"
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
  Ref,
  toRefs,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { UserId } from '@/types/entity-ids'
import { useNavigation } from './use/navigation'
import UserIcon from '@/components/UI/UserIcon.vue'
import Feature from './Feature/Feature.vue'
import NavigationSelector from './NavigationSelector.vue'
import NavigationContent from './NavigationContent.vue'

const useStyles = (iconSize: number, isMobile: Ref<boolean>) =>
  reactive({
    content: makeStyles(theme => ({
      color: theme.ui.secondary,
      background: theme.background.secondary,
      borderColor: theme.background.secondary,
      paddingTop: isMobile.value ? 0 : `${iconSize / 2}px`
    })),
    icon: makeStyles(theme => ({
      marginTop: `${-iconSize / 2}px`,
      borderColor: theme.background.secondary,
      backgroundColor: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'UserModal',
  props: {
    id: {
      type: String as PropType<UserId>,
      required: true
    }
  },
  setup(props) {
    const isMobile = computed(() => store.getters.ui.isMobile)

    const iconSize = 160
    const styles = computed(() => useStyles(iconSize, isMobile))

    const onClickClear = () => store.dispatch.ui.modal.clearModal()

    const { navigationSelectorState, onNavigationChange } = useNavigation()
    const user = computed(() => store.state.entities.users[props.id])

    return {
      isMobile,
      styles,
      onClickClear,
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
  width: 80%;
  height: 60%;
  max-width: 640px;
  max-height: 480px;
}

.content {
  position: relative;
  display: grid;
  grid-template-columns: min-content 1fr;
  grid-template-rows: min-content 1fr;
  height: 100%;
  border: 4px solid;
  border-radius: 16px;
  overflow: hidden;
}

.close {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

.icon {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  margin: auto;
  border: 6px solid;
}
</style>
