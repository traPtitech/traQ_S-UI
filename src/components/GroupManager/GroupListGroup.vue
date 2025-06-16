<template>
  <group-list-group-edit v-if="isSelected" :group="group" />
  <group-list-group-view v-else :group="group" @click-edit="onSelect" />
</template>

<script lang="ts" setup>
import GroupListGroupEdit from './GroupListGroupEdit.vue'
import GroupListGroupView from './GroupListGroupView.vue'
import type { UserGroup } from '@traptitech/traq'
import type { UserGroupId } from '/@/types/entity-ids'

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
