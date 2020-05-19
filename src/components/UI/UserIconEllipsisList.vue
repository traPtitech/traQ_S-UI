<template>
  <transition-group
    :name="transition"
    :class="$style.container"
    :style="styles.container"
  >
    <span
      v-if="inVisibleCount > 0 && showCount"
      :class="$style.count"
      :style="styles.count"
    >
      +{{ inVisibleCount }}
    </span>
    <user-icon
      :class="$style.userIcon"
      :user-id="userId"
      :size="iconSize"
      v-for="userId in visibleIconIds"
      :key="userId"
      :style="styles.userIcon"
    />
  </transition-group>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import UserIcon from '@/components/UI/UserIcon.vue'
import { UserId } from '@/types/entity-ids'

const useSizeStyles = (props: {
  direction: 'row' | 'col'
  borderWidth: number
  overlap: number
}) =>
  computed(() => {
    const isRow = props.direction === 'row'
    return {
      container: {
        flexDirection: isRow ? 'row-reverse' : 'column-reverse',
        [isRow ? 'marginLeft' : 'marginTop']: `${props.overlap}px`
      },
      userIcon: {
        borderWidth: `${props.borderWidth}px`,
        [isRow ? 'marginLeft' : 'marginTop']: `-${props.overlap}px`
      },
      count: {
        [isRow ? 'marginLeft' : 'marginTop']: '0.5em'
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
    userIds: { type: Array as PropType<UserId[]>, default: [] },
    borderWidth: { type: Number, default: 4 },
    iconSize: { type: Number, default: 40 },
    overlap: { type: Number, default: 12 },
    transition: String
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
