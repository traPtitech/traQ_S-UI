<template>
  <div :class="$style.body" :style="styles.body">
    <span v-if="props.isBot">Bot</span>
    <span v-else-if="state.grade">{{ state.grade }}</span>
    <span v-else>Admin</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { UserId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'

type Props = {
  userId: UserId
  isBot: boolean
}

export default defineComponent({
  name: 'GradeBadge',
  props: {
    userId: {
      type: String,
      required: true
    },
    isBot: {
      type: Boolean,
      default: false
    }
  },
  setup(props: Props) {
    const state = reactive({
      grade: computed(() =>
        store.getters.entities.gradeNameByUserId(props.userId)
      )
    })
    const styles = reactive({
      body: makeStyles(theme => {
        return {
          color: theme.ui.secondary,
          backgroundColor: theme.background.secondary
        }
      })
    })
    return { props, state, styles }
  }
})
</script>

<style lang="scss" module>
.body {
  display: inline-flex;
  align-items: center;
  font-weight: bold;
  font-size: 14px;
  border-radius: 4px;
  padding: 0 4px;
}
</style>
