<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{ state.displayName }}</span>
    <grade-badge :class="$style.badge" :user-id="userId" :is-bot="state.bot" />
    <span :class="$style.name" :style="styles.name">@{{ state.name }}</span>
    <icon
      v-if="createdAt !== updatedAt"
      :class="$style.date"
      :style="styles.date"
      :width="12"
      :height="12"
      name="pencil"
      mdi
    />
    <span
      v-if="createdAt !== updatedAt"
      :class="$style.edit"
      :style="styles.date"
      >編集済み</span
    >
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
import Icon from '@/components/UI/Icon.vue'

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
  components: { GradeBadge, Icon },
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
  @include size-body2;
  margin-left: 4px;

  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.edit {
  font-size: 0.75rem;
}

.date {
  @include size-caption;
  margin-left: 4px;
}
</style>
