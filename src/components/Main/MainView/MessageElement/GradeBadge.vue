<template>
  <div
    v-if="isBot || isGrade"
    :class="$style.body"
    :data-is-grade="isGrade"
    :data-background="props.background"
    :data-font-size="props.fontSize"
    :data-color="props.color"
    @click="onClick"
  >
    <span v-if="isBot">Bot</span>
    <bdi v-else-if="gradeGroup">{{ gradeGroup.name }}</bdi>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useGroupsStore } from '/@/store/entities/groups'
import { useModalStore } from '/@/store/ui/modal'
import type { UserId } from '/@/types/entity-ids'

const props = withDefaults(
  defineProps<{
    userId: UserId
    isBot?: boolean
    background?: 'primary' | 'secondary' | 'tertiary' | 'none'
    fontSize?: 'body1' | 'body2'
    color?: 'ui-primary' | 'ui-secondary' | 'ui-tertiary'
  }>(),
  {
    isBot: false,
    background: 'secondary',
    fontSize: 'body2',
    color: 'ui-secondary'
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
  // background
  &[data-background='primary'] {
    @include background-primary;
  }

  &[data-background='secondary'] {
    @include background-secondary;
  }

  &[data-background='tertiary'] {
    @include background-tertiary;
  }

  // fontSize
  &[data-fontSize='body1'] {
    @include size-body1;
  }

  &[data-fontSize='body2'] {
    @include size-body2;
  }

  // color
  &[data-color='ui-primary'] {
    @include color-ui-primary;
  }

  &[data-color='ui-secondary'] {
    @include color-ui-secondary;
  }

  &[data-color='ui-tertiary'] {
    @include color-ui-tertiary;
  }

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
