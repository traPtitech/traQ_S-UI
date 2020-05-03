<template>
  <div :class="$style.body" :style="styles.body">
    <span v-if="isBot">Bot</span>
    <span v-else-if="state.grade">{{ state.grade }}</span>
    <span v-else>Admin</span>
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

export default defineComponent({
  name: 'GradeBadge',
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    isBot: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
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
    return { state, styles }
  }
})
</script>

<style lang="scss" module>
.body {
  @include body2-size;
  display: inline-flex;
  align-items: center;
  font-weight: bold;
  border-radius: 4px;
  padding: 0 4px;
}
</style>
