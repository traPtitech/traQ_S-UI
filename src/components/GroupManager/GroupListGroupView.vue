<template>
  <div :class="$style.container">
    <div :class="$style.name">
      <bdi :class="$style.nameText" dir="auto">{{ group.name }}</bdi>
      <UserGroupMemberCount :group="group" :class="$style.memberCount" />
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

import AIcon from '/@/components/UI/AIcon.vue'
import UserGroupMemberCount from '/@/components/UI/UserGroupMemberCount.vue'
import UserIconEllipsisList from '/@/components/UI/UserIconEllipsisList.vue'

defineProps<{
  group: UserGroup
}>()

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
  margin-left: 0.35rem;
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
