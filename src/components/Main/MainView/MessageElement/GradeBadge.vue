<template>
  <div :class="$style.body">
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
    return { state }
  }
})
</script>

<style lang="scss" module>
.body {
  @include background-secondary;
  @include color-ui-secondary;
  @include size-body2;
  display: inline-flex;
  align-items: center;
  font-weight: bold;
  border-radius: 4px;
  padding: 0 4px;
}
</style>
