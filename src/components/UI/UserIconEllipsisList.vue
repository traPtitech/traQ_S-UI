<template>
  <div
    :class="$style.container"
    :style="styles.container"
    @click="emit('toggle')"
  >
    <transition-group :name="transition">
      <span
        v-if="inVisibleCount > 0 && showCount"
        key="count"
        :data-is-clickable="$boolAttr(countClickable)"
        :class="$style.count"
        :style="styles.count"
        @click="onCountClick"
      >
        +{{ inVisibleCount }}
      </span>
      <user-icon
        v-for="userId in visibleIconIds"
        :key="userId"
        :class="$style.userIcon"
        :user-id="userId"
        :size="iconSize"
        :prevent-modal="preventModal"
        :style="styles.userIcon"
      />
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { IconSize } from '/@/components/UI/UserIcon.vue'
import type { UserId } from '/@/types/entity-ids'
import UserIcon from '/@/components/UI/UserIcon.vue'

const props = withDefaults(
  defineProps<{
    direction: 'row' | 'col'
    max?: number
    showCount?: boolean
    userIds?: readonly UserId[]
    borderWidth?: number
    iconSize?: IconSize
    overlap?: number
    transition?: string
    preventModal?: boolean
    countClickable?: boolean
  }>(),
  {
    max: 3,
    showCount: true,
    userIds: () => [],
    borderWidth: 4,
    iconSize: 40 as const,
    overlap: 12,
    preventModal: false,
    countClickable: false
  }
)

const emit = defineEmits<{
  (e: 'countClick'): void
  (e: 'toggle'): void
}>()

const styles = computed(() => {
  const isRow = props.direction === 'row'
  const marginStartVal = <M extends string>(
    m: M
  ): { marginLeft: M } | { marginTop: M } =>
    isRow ? { marginLeft: m } : { marginTop: m }

  return {
    container: {
      flexDirection: isRow
        ? ('row-reverse' as const)
        : ('column-reverse' as const),
      ...marginStartVal(`${props.overlap}px`)
    },
    userIcon: {
      borderWidth: `${props.borderWidth}px`,
      ...marginStartVal(`-${props.overlap}px`)
    },
    count: {
      ...marginStartVal('0.25em')
    }
  }
})

const visibleIconIds = computed(() =>
  [...props.userIds].reverse().slice(0, props.max)
)
const inVisibleCount = computed(() => props.userIds.length - props.max)

const onCountClick = () => {
  if (props.countClickable) {
    emit('countClick')
  }
}
</script>

<style lang="scss" module>
$countSize: 1.15rem;

.container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.userIcon {
  border: solid $theme-background-primary-border;
  background-color: $theme-background-primary-border;
}

.count {
  font-weight: bold;
  user-select: none;
  &[data-is-clickable] {
    cursor: pointer;
    transition: transform 0.1s;
    &:hover {
      transform: scale(1.1);
    }
  }
}
</style>
