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

<script lang="ts" setup>
import { computed } from 'vue'
import type { UserId } from '/@/types/entity-ids'
import { useModalStore } from '/@/store/ui/modal'
import { useGroupsStore } from '/@/store/entities/groups'

const props = withDefaults(
  defineProps<{
    userId: UserId
    isBot?: boolean
  }>(),
  {
    isBot: false
  }
)

const { pushModal } = useModalStore()
const { getGradeGroupsByUserId } = useGroupsStore()

const gradeGroup = computed(() => getGradeGroupsByUserId(props.userId))
const isGrade = computed(() => !!gradeGroup.value)

const onClick = () => {
  if (!gradeGroup.value) return
  pushModal({
    type: 'group',
    id: gradeGroup.value.id
  })
}
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
