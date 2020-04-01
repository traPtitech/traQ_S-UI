<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{ state.user.displayName }}</span>
    <grade-badge
      :class="$style.badge"
      :userId="props.userId"
      :isBot="state.user.bot"
    />
    <span :class="$style.date" :style="styles.date">{{ state.date }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { UserId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { getDisplayDate } from '@/lib/date'
import GradeBadge from './GradeBadge.vue'

type Props = {
  userId: UserId
  createdAt: string
  updatedAt: string
}

export default defineComponent({
  name: 'MessageHeader',
  props: {
    userId: {
      type: String,
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
  setup(props: Props) {
    const state = reactive({
      user: computed(() => store.state.entities.users[props.userId]),
      date: computed(() => getDisplayDate(props.createdAt, props.updatedAt))
    })
    const styles = reactive({
      displayName: makeStyles(theme => {
        return {
          color: theme.ui.tertiary
        }
      }),
      date: makeStyles(theme => {
        return {
          color: theme.ui.secondary
        }
      })
    })

    return { props, state, styles }
  }
})
</script>

<style lang="scss" module>
.header {
  display: inline-flex;
  align-items: center;
}

.displayName {
  font-weight: bold;
}

.badge {
  margin-left: 4px;
}

.date {
  margin-left: 4px;
  font-size: 12px;
}
</style>
