<template>
  <div :class="$style.container" :style="styles.container">
    <transition-group :name="transition">
      <span
        v-if="inVisibleCount > 0 && showCount"
        key="count"
        :class="$style.count"
        :style="styles.count"
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

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import UserIcon, { IconSize } from '/@/components/UI/UserIcon.vue'
import { UserId } from '/@/types/entity-ids'

const useSizeStyles = (props: {
  direction: 'row' | 'col'
  borderWidth: number
  overlap: number
}) =>
  computed(() => {
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

export default defineComponent({
  name: 'UserIconEllipsisList',
  components: { UserIcon },
  props: {
    direction: { type: String as PropType<'row' | 'col'>, required: true },
    /**
     * 表示するUserIconの最大数(0以上)
     */
    max: { type: Number, default: 3 },
    showCount: { type: Boolean, default: true },
    userIds: { type: Array as PropType<readonly UserId[]>, default: () => [] },
    borderWidth: { type: Number, default: 4 },
    iconSize: { type: Number as PropType<IconSize>, default: 40 as const },
    overlap: { type: Number, default: 12 },
    transition: { type: String, default: undefined },
    preventModal: { type: Boolean, default: false }
  },
  setup(props) {
    const styles = useSizeStyles(props)
    const visibleIconIds = computed(() =>
      [...props.userIds].reverse().slice(0, props.max)
    )
    const inVisibleCount = computed(() => props.userIds.length - props.max)
    return {
      styles,
      visibleIconIds,
      inVisibleCount
    }
  }
})
</script>

<style lang="scss" module>
$countSize: 1.15rem;

.container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.userIcon {
  border: solid $theme-background-primary;
  background-color: $theme-background-primary;
}

.count {
  font-weight: bold;
  user-select: none;
}
</style>
