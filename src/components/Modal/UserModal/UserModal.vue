<template>
  <click-outside stop @click-outside="clearModal">
    <div :class="$style.wrapper" data-testid="usermodal">
      <close-button
        :size="isMobile ? 24 : 32"
        :class="$style.close"
        @close="clearModal"
      />
      <user-icon
        v-if="!isMobile"
        :user-id="id"
        prevent-modal
        :class="$style.icon"
        :style="styles.icon"
      />
      <div :class="$style.content" :style="styles.content">
        <feature-container :user="user" :detail="userDetail" />
        <navigation-selector
          :current-navigation="currentNavigation"
          @navigation-change="onNavigationChange"
        />
        <navigation-content
          :current-navigation="currentNavigation"
          :user="user"
          :detail="userDetail"
        />
      </div>
    </div>
  </click-outside>
</template>

<script lang="ts">
import { computed, reactive, Ref, toRef } from 'vue'
import { UserId } from '/@/types/entity-ids'
import { useNavigation } from './composables/useNavigation'
import useUserDetail from './composables/useUserDetail'
import { useModalStore } from '/@/store/ui/modal'
import { useResponsiveStore } from '/@/store/ui/responsive'
import { useUsersStore } from '/@/store/entities/users'

const useStyles = (iconSize: number, isMobile: Ref<boolean>) =>
  reactive({
    content: computed(() => ({
      paddingTop: isMobile.value ? 0 : `min(${iconSize / 2}px, 10vh)`
    })),
    icon: computed(() => ({
      marginTop: `max(-${iconSize / 2}px, -10vh)`,
      width: `min(${iconSize}px, 20vh)`,
      height: `min(${iconSize}px, 20vh)`
    }))
  })
</script>

<script lang="ts" setup>
import ClickOutside from '/@/components/UI/ClickOutside'
import UserIcon from '/@/components/UI/UserIcon.vue'
import FeatureContainer from './FeatureContainer/FeatureContainer.vue'
import NavigationSelector from './NavigationSelector.vue'
import NavigationContent from './NavigationContent.vue'
import CloseButton from '/@/components/UI/CloseButton.vue'

const props = defineProps<{
  id: UserId
}>()

const { clearModal } = useModalStore()
const { isMobile } = useResponsiveStore()
const { usersMap } = useUsersStore()

const iconSize = 160
const styles = computed(() => useStyles(iconSize, isMobile))

const { navigationSelectorState, onNavigationChange } = useNavigation()
const currentNavigation = toRef(navigationSelectorState, 'currentNavigation')

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const user = computed(() => usersMap.value.get(props.id)!)

const { userDetail } = useUserDetail(props)
</script>

<style lang="scss" module>
.wrapper {
  position: relative;
  width: #{calc(100% - 32px)};
  height: 80%;
  max-width: 640px;
  max-height: 480px;
}

.content {
  @include color-ui-primary;
  @include background-secondary;
  position: relative;
  display: grid;
  grid-template-columns: min-content 1fr;
  grid-template-rows: min-content 1fr;
  height: 100%;
  border: 4px solid $theme-background-secondary-border;
  border-radius: 16px;
  overflow: hidden;
}

.close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: $z-index-user-modal-header;
}

.icon {
  background-color: $theme-background-secondary-border;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-index-user-modal-header;
  margin: auto;
  border: 6px solid $theme-background-secondary-border;
}
</style>
