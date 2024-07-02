<template>
  <div
    :role="isClickable ? 'button' : 'img'"
    :class="$style.container"
    :style="styles.container"
    @click.prevent.stop="openModal"
  >
    <div v-if="hasNotification" :class="$style.indicator">
      <notification-indicator :size="indicatorSize" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed, watch, toRef } from 'vue'
import { buildUserIconPath } from '/@/lib/apis'
import type { UserId, FileId } from '/@/types/entity-ids'
import { useUserModalOpener } from '/@/composables/modal/useUserModalOpener'
import { useMeStore } from '/@/store/domain/me'
import { useUsersStore } from '/@/store/entities/users'
import NotificationIndicator from '/@/components/UI/NotificationIndicator.vue'

export type IconSize =
  | 200
  | 160
  | 100
  | 64
  | 48
  | 44
  | 40
  | 36
  | 32
  | 28
  | 24
  | 20

const props = withDefaults(
  defineProps<{
    userId: UserId
    fallbackIconFileId?: FileId
    size?: IconSize
    indicatorSize?: number
    preventModal?: boolean
    hasNotification?: boolean
  }>(),
  {
    size: 36,
    indicatorSize: 10,
    preventModal: false,
    hasNotification: false
  }
)

const { detail, myId } = useMeStore()
const { usersMap, fetchUser } = useUsersStore()

watch(
  () => props.userId,
  userId => {
    if (!userId) return
    fetchUser({ userId })
  },
  { immediate: true }
)

const user = computed(() =>
  props.userId === myId.value ? detail.value : usersMap.value.get(props.userId)
)
const userIconFileId = computed(
  () => user.value?.iconFileId ?? props.fallbackIconFileId ?? ''
)
const styles = reactive({
  container: computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
    backgroundImage: userIconFileId.value
      ? `url(${buildUserIconPath(userIconFileId.value)})`
      : undefined,
    pointerEvents: props.preventModal ? ('none' as const) : undefined
  }))
})

const { isClickable, openModal } = useUserModalOpener(
  toRef(props, 'userId'),
  toRef(props, 'preventModal')
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  position: relative;
  border-radius: 100vw;
  flex: {
    shrink: 0;
    grow: 0;
  }
  background: {
    position: center;
    repeat: no-repeat;
    size: cover;
  }
  &[role='button'] {
    cursor: pointer;
  }
}
.indicator {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
