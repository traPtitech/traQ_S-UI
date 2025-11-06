<template>
  <ClickOutside stop @click-outside="clearModal">
    <div :class="$style.wrapper" data-testid="usermodal">
      <div :class="$style.topButtons">
        <UserModalEditButton
          v-if="isThisMyProfile"
          :size="isMobile ? 24 : 32"
          @mousedown="onEditProfileClick"
        />
        <CloseButton :size="isMobile ? 24 : 32" @close="clearModal" />
      </div>

      <UserIcon
        v-if="!isMobile"
        :user-id="id"
        prevent-modal
        :class="$style.icon"
        :style="styles.icon"
      />
      <div :class="$style.content" :style="styles.content">
        <FeatureContainer :user="user" :detail="userDetail" />
        <NavigationSelector
          :current-navigation="navigation"
          @navigation-change="onNavigationChange"
        />
        <NavigationContent
          :current-navigation="navigation"
          :user="user"
          :detail="userDetail"
        />
      </div>
    </div>
  </ClickOutside>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue'

import { useOpenLinkAndClearModal } from '/@/components/Modal/composables/useOpenLinkFromModal'
import ClickOutside from '/@/components/UI/ClickOutside'
import CloseButton from '/@/components/UI/CloseButton.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { useMeStore } from '/@/store/domain/me'
import { useUsersStore } from '/@/store/entities/users'
import { useModalStore } from '/@/store/ui/modal'
import type { UserModalNavigationItemType } from '/@/store/ui/modal/states'
import { useResponsiveStore } from '/@/store/ui/responsive'
import type { UserId } from '/@/types/entity-ids'

import FeatureContainer from './FeatureContainer/FeatureContainer.vue'
import NavigationContent from './NavigationContent.vue'
import NavigationSelector from './NavigationSelector.vue'
import UserModalEditButton from './UserModalEditButton.vue'
import useUserDetail from './composables/useUserDetail'

const props = defineProps<{
  id: UserId
  navigation?: UserModalNavigationItemType
}>()

const { clearModal, replaceModal } = useModalStore()
const { isMobile } = useResponsiveStore()
const { usersMap } = useUsersStore()
const { openLinkAndClearModal } = useOpenLinkAndClearModal()

const iconSize = 160
const styles = reactive({
  content: computed(() => ({
    paddingTop: isMobile.value ? 0 : `min(${iconSize / 2}px, 10vh)`
  })),
  icon: computed(() => ({
    marginTop: `max(-${iconSize / 2}px, -10vh)`,
    width: `min(${iconSize}px, 20vh)`,
    height: `min(${iconSize}px, 20vh)`
  }))
})

const onNavigationChange = (type: UserModalNavigationItemType) => {
  replaceModal({
    type: 'user',
    id: props.id,
    navigation: type
  })
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const user = computed(() => usersMap.value.get(props.id)!)

const { userDetail } = useUserDetail(props)

const onEditProfileClick = async (event: MouseEvent) => {
  openLinkAndClearModal(event, '/settings/profile')
}

const { myId } = useMeStore()

const isThisMyProfile = computed(() => props.id === myId.value)
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

.topButtons {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: $z-index-user-modal-header;
  justify-content: flex-end;
  display: flex;
  gap: 8px;
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
