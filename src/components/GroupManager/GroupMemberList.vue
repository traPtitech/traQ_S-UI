<template>
  <div>
    <div :class="$style.header">
      <div :class="$style.label">メンバー</div>
      <a-icon
        name="plus-circle-outline"
        mdi
        :class="$style.controlIcon"
        @click="onClickAdd"
      />
      <a-icon
        name="close"
        mdi
        :class="$style.controlIcon"
        @click="onClickDeleteAll"
      />
    </div>
    <div :class="$style.list">
      <group-user
        v-for="member in members"
        :id="member.id"
        :key="member.id"
        show-edit-button
        @edit="onEdit(member.id)"
        @delete="onDelete(member.id)"
      >
        <div :class="$style.role">
          {{ member.role }}
        </div>
      </group-user>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import GroupUser from './GroupUser.vue'
import type { UserGroupId } from '/@/types/entity-ids'
import apis from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import type { UserGroupMember } from '@traptitech/traq'
import { useModalStore } from '/@/store/ui/modal'

const props = defineProps<{
  groupId: UserGroupId
  members: UserGroupMember[]
}>()

const { pushModal } = useModalStore()
const { addErrorToast } = useToastStore()

const onClickAdd = () => {
  pushModal({
    type: 'group-member-add',
    id: props.groupId
  })
}

const onClickDeleteAll = async () => {
  if (!confirm('本当に全メンバーを削除しますか？')) return

  try {
    apis.removeUserGroupMembers(props.groupId)
  } catch {
    addErrorToast('全メンバーの削除に失敗しました')
  }
}

const onEdit = (id: string) => {
  pushModal({
    type: 'group-member-edit',
    groupId: props.groupId,
    userId: id
  })
}

const onDelete = async (id: string) => {
  if (!confirm('本当にこのメンバーを削除しますか？')) return
  try {
    await apis.removeUserGroupMember(props.groupId, id)
  } catch {
    addErrorToast('メンバーの削除に失敗しました')
  }
}
</script>

<style lang="scss" module>
.header {
  display: flex;
  align-items: center;
}
.label {
  @include color-ui-primary;
  flex: 1;
  margin-bottom: 4px;
  font-weight: bold;
}
.controlIcon {
  @include color-ui-primary-inactive;
  cursor: pointer;
  &:hover {
    @include color-ui-primary;
  }
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}
.role {
  @include size-caption;
  word-break: break-all;
}
</style>
