<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{ getUser().displayName }}</span>
    <grade-badge
      :class="$style.badge"
      :user-id="userId"
      :is-bot="getUser().bot"
    />
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
import apis from '../../../../lib/api'
import { User } from '@traptitech/traq'

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
    const getUser = () => {
      if (state.user === undefined) {
        apis.getUser(props.userId).then(res => {
          const data = res.data as User
          state.user = data
        })
      }
      return state.user
    }
    return { state, styles, getUser }
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
