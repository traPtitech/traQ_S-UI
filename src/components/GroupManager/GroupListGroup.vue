<template>
  <div ref="rootRef">
    <GroupListGroupEdit v-if="isSelected" :group="group" />
    <GroupListGroupView v-else :group="group" @click-edit="onSelect" />
  </div>
</template>

<script lang="ts" setup>
import type { UserGroup } from '@traptitech/traq'

import { nextTick, ref, watch } from 'vue'

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

const rootRef = ref<HTMLElement | null>(null)

const onSelect = () => {
  emit('select', props.group.id)
}

watch(
  () => props.isSelected,
  async isSelected => {
    if (!isSelected) return

    await nextTick()

    rootRef.value?.scrollIntoView({
      block: 'nearest'
    })
  },
  {
    immediate: true
  }
)
</script>
