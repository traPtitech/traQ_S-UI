<template>
  <div
    :role="isClickable ? 'button' : 'listitem'"
    :class="$style.container"
    @click.stop="openModal"
  >
    <user-icon :class="$style.icon" :user-id="userId" :size="36" />
    <div :class="$style.desc">
      <div :class="$style.displayName">
        <a-icon
          v-if="isAdmin"
          :class="$style.adminIcon"
          name="crown"
          mdi
          title="管理者"
        />
        <span>{{ displayName }}</span>
      </div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import UserIcon from '/@/components/UI/UserIcon.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { computed, toRef } from 'vue'
import { useUserModalOpener } from '/@/composables/modal/useUserModalOpener'
import { useUsersStore } from '/@/store/entities/users'

const props = withDefaults(
  defineProps<{
    userId?: string
    isAdmin?: boolean
  }>(),
  {
    userId: '',
    isAdmin: false
  }
)

const { usersMap } = useUsersStore()
const displayName = computed(
  () => usersMap.value.get(props.userId)?.displayName
)

const { isClickable, openModal } = useUserModalOpener(toRef(props, 'userId'))
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  position: relative;
  display: flex;
  align-items: center;
  padding: 4px;
  &[role='button'] {
    cursor: pointer;
  }

  &:hover::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: $theme-ui-primary-background;
    opacity: 0.1;
  }
}
.icon {
  margin-right: 16px;
}
.desc {
  min-width: 0;
}
.displayName {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.adminIcon {
  margin-right: 0.25rem;
  vertical-align: bottom;
}
</style>
