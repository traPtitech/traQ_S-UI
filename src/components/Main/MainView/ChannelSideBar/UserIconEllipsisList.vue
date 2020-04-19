<template>
  <div :class="$style.container" :style="styles.container">
    <span
      v-if="inVisibleCount > 0 && propst.showCount"
      :class="$style.count"
      :style="styles.count"
    >
      +{{ inVisibleCount }}
    </span>
    <user-icon
      :class="$style.userIcon"
      :user-id="userId"
      :size="40"
      v-for="userId in visibleIconIds"
      :key="userId"
      :style="styles.userIcon"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  ref,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import UserIcon from '@/components/UI/UserIcon.vue'
import { ChannelViewState } from '@traptitech/traq'
import { UserId } from '@/types/entity-ids'

const useStyles = (props: {
  direction: 'row' | 'col'
  max: number
  showCount: boolean
  userIds: string[]
}) =>
  reactive({
    container: makeStyles(theme => ({
      flexDirection:
        props.direction === 'row' ? 'row-reverse' : 'column-reverse'
    })),
    userIcon: makeStyles(theme => ({
      marginTop: props.direction === 'row' ? '0px' : '-12px',
      marginRight: props.direction === 'col' ? '0px' : '-12px'
    })),
    count: makeStyles(theme => ({
      marginTop: props.direction === 'row' ? '0px' : '20px',
      marginLeft: props.direction === 'col' ? '0px' : '20px'
    }))
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
    userIds: { type: Array as PropType<UserId[]>, default: [] }
  },
  setup(props) {
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst = props as {
      direction: 'row' | 'col'
      max: number
      showCount: boolean
      userIds: UserId[]
    }
    const styles = useStyles(propst)
    const visibleIconIds = computed(() => propst.userIds.slice(0, propst.max))
    const inVisibleCount = computed(() => propst.userIds.length - propst.max)
    return {
      styles,
      propst,
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
  position: relative;
  border-radius: 4px;
  align-items: center;
}

.userIcon {
  margin-right: -12px;
  border: 4px solid white;
}

.count {
  font-weight: bold;
}
</style>
