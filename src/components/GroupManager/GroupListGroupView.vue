<template>
  <div :class="$style.container">
    <div :class="$style.name">
      <bdi :class="$style.nameText" dir="auto">{{ group.name }}</bdi>
      <span :class="$style.memberCount">
        <AIcon name="crown" mdi :size="21" />
        <span>{{ adminCount }}</span>
        <span :class="$style.separator">/</span>
        <AIcon name="user" :size="21" />
        <span style="margin-right: 0.2rem">{{ memberCount }}</span>
      </span>
    </div>
    <div :class="$style.adminList">
      <AIcon name="crown" mdi />
      <UserIconEllipsisList
        direction="row"
        :user-ids="group.admins"
        prevent-modal
      />
    </div>
    <div :class="$style.editIconWrapper">
      <AIcon
        name="pencil-outline"
        mdi
        :class="$style.editIcon"
        @click="emit('clickEdit')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { UserGroup } from '@traptitech/traq'

import { computed } from 'vue'

import AIcon from '/@/components/UI/AIcon.vue'
import UserIconEllipsisList from '/@/components/UI/UserIconEllipsisList.vue'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
  group: UserGroup
}>()

const { activeUsersMap } = useUsersStore()

const adminCount = computed(
  () => props.group.admins.filter(id => activeUsersMap.value.has(id)).length
)
const memberCount = computed(
  () => props.group.members.filter(m => activeUsersMap.value.has(m.id)).length
)

const emit = defineEmits<{
  (e: 'clickEdit'): void
}>()
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template:
    'name edit'
    'adminList edit' / minmax(0, 1fr) min-content;
  align-items: center;
}
.name {
  @include color-ui-primary;
  grid-area: name;
  display: flex;
  align-items: center;
  min-width: 0;
  font-weight: bold;
  text-align: left;
}
.nameText {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.memberCount {
  @include color-ui-secondary;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 0.35rem;
  white-space: nowrap;
  &::before {
    content: '(';
  }
  &::after {
    content: ')';
  }
}
.separator {
  margin: 0 0.1rem 0 0.3rem;
}
.adminList {
  @include color-ui-secondary;
  grid-area: adminList;
  display: flex;
  align-items: center;
}
.editIconWrapper {
  @include color-ui-primary;
  grid-area: edit;
}
.editIcon {
  cursor: pointer;
}
</style>
