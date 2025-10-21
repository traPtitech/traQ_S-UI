<template>
  <div
    :role="isClickable ? 'button' : 'img'"
    :class="$style.container"
    :style="styles.container"
    :data-is-inactive="$boolAttr(isInactive)"
    @click.prevent.stop="openModal"
  >
    <div v-if="hasNotification" :class="$style.indicator">
      <NotificationIndicator :size="indicatorSize" />
    </div>
    <!-- <div v-if="isInactive" :class="$style.mask" /> -->
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
import { SvgPathBuilder } from '/@/lib/svg/path'
import type { Point } from '/@/lib/basic/point'

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
    overlap?: number
    preventModal?: boolean
    hasNotification?: boolean
    isInactive?: boolean
  }>(),
  {
    size: 36,
    indicatorSize: 10,
    overlap: 0,
    preventModal: false,
    hasNotification: false,
    isInactive: false
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

const clipPath = computed(() => {
  const radius = props.size / 2
  const chord = 2 * Math.sqrt(props.overlap * (radius - props.overlap / 4))

  const begin: Point = {
    x: radius - chord / 2,
    y: props.overlap / 2
  }

  return new SvgPathBuilder()
    .moveTo(begin)
    .arcToRelative(
      { x: radius, y: radius },
      { x: chord, y: 0 },
      { large: true }
    )
    .arcTo({ x: radius, y: radius }, begin, { sweep: true })
})

const styles = reactive({
  container: computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
    backgroundImage: userIconFileId.value
      ? `url(${buildUserIconPath(userIconFileId.value)})`
      : undefined,
    pointerEvents: props.preventModal ? ('none' as const) : undefined,
    clipPath: `path('${clipPath.value}')`
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

  &[data-is-inactive] {
    opacity: 0.5;
  }
}
.indicator {
  position: absolute;
  top: 0;
  right: 0;
}
.mask {
  @include background-primary;
  width: 100%;
  height: 100%;
  border-radius: 100vw;
  opacity: 0.5;
}
</style>
