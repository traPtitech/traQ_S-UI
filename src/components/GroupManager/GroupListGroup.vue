<template>
  <GroupListGroupEdit v-if="isSelected" :group="group" />
  <GroupListGroupView v-else :group="group" @click-edit="onSelect" />
</template>

<script lang="ts" setup>
import type { UserGroup } from '@traptitech/traq'

import type { UserGroupId } from '/@/types/entity-ids'

import GroupListGroupEdit from './GroupListGroupEdit.vue'
import GroupListGroupView from './GroupListGroupView.vue'

const props = withDefaults(
  defineProps<{
    group: UserGroup
    isSelected?: boolean
  }>(),
  {
    isSelected: false
  }
)

const emit = defineEmits<{
  (e: 'select', _groupId: UserGroupId): void
}>()

const onSelect = () => {
  emit('select', props.group.id)
}
</script>
