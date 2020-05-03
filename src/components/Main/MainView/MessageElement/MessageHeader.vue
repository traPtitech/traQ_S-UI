<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{ state.displayName }}</span>
    <grade-badge :class="$style.badge" :user-id="userId" :is-bot="state.bot" />
    <span :class="$style.name" :style="styles.name">@{{ state.name }}</span>
    <span :class="$style.date" :style="styles.date">{{ state.date }}</span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  PropType
} from '@vue/composition-api'
import { UserId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { getDisplayDate } from '@/lib/date'
import GradeBadge from './GradeBadge.vue'

const useStyles = () =>
  reactive({
    date: makeStyles(theme => ({
      color: theme.ui.secondary
    })),
    name: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'MessageHeader',
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    createdAt: {
      type: String,
      required: true
    },
    updatedAt: {
      type: String,
      required: true
    }
  },
  components: { GradeBadge },
  setup(props) {
    const state = reactive({
      user: computed(() => store.state.entities.users[props.userId]),
      displayName: computed((): string => state.user?.displayName ?? 'unknown'),
      name: computed((): string => state.user?.name ?? 'unknown'),
      bot: computed((): boolean => state.user?.bot ?? false),
      date: computed(() => getDisplayDate(props.createdAt, props.updatedAt))
    })
    if (state.user === undefined) {
      store.dispatch.entities.fetchUser(props.userId)
    }

    const styles = useStyles()
    return { state, styles }
  }
})
</script>

<style lang="scss" module>
.header {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.displayName {
  font-weight: bold;
  word-break: keep-all;
  white-space: nowrap;
}

.badge {
  margin-left: 4px;
}

.name {
  @include body2-size;
  margin-left: 4px;

  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.date {
  @include caption-size;
  margin-left: 4px;
}
</style>
