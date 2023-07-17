<template>
  <div :class="$style.container">
    <div :class="$style.name">{{ group.name }}</div>
    <div :class="$style.adminList">
      <a-icon name="crown" mdi />
      <user-icon-ellipsis-list
        direction="row"
        :user-ids="group.admins"
        prevent-modal
      />
    </div>
    <div :class="$style.editIconWrapper">
      <icon-button
        icon-name="pencil-outline"
        icon-mdi
        :class="$style.editIconButton"
        @click="emit('clickEdit')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import UserIconEllipsisList from '/@/components/UI/UserIconEllipsisList.vue'
import type { UserGroup } from '@traptitech/traq'
import iconButton from '/@/components/UI/IconButton.vue'

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
    'adminList edit' / 1fr min-content;
  align-items: center;
}
.name {
  @include color-ui-primary;
  grid-area: name;
  font-weight: bold;
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
.editIconButton {
  cursor: pointer;
}
</style>
