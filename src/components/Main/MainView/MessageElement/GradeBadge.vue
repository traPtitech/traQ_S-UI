<template>
  <div
    v-if="isBot || isGrade"
    :class="$style.body"
    :data-is-grade="isGrade"
    @click="onClick"
  >
    <span v-if="isBot">Bot</span>
    <span v-else-if="gradeGroup">{{ gradeGroup.name }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { UserId } from '/@/types/entity-ids'
import store from '/@/vuex'
import { useModalStore } from '/@/store/ui/modal'

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
    const { pushModal } = useModalStore()

    const gradeGroup = computed(() =>
      store.getters.entities.gradeGroupByUserId(props.userId)
    )
    const isGrade = computed(() => !!gradeGroup.value)

    const onClick = () => {
      if (!gradeGroup.value) return
      pushModal({
        type: 'group',
        id: gradeGroup.value.id
      })
    }

    return { gradeGroup, isGrade, onClick }
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
  &[data-is-grade='true'] {
    cursor: pointer;
  }
}
</style>
