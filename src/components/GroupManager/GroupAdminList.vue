<template>
  <div>
    <div :class="$style.header">
      <div :class="$style.label">
        管理者
        <span :class="$style.count">
          <SpinNumber :value="admins.length" />
        </span>
      </div>
      <AIcon
        name="plus-circle-outline"
        mdi
        :class="$style.addIcon"
        @click="onClickAdd"
      />
    </div>
    <div :class="$style.list">
      <GroupUser
        v-for="admin in admins"
        :id="admin"
        :key="admin"
        @delete="onDelete(admin)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import SpinNumber from '/@/components/UI/SpinNumber.vue'
import apis from '/@/lib/apis'
import { useModalStore } from '/@/store/ui/modal'
import { useToastStore } from '/@/store/ui/toast'
import type { UserGroupId, UserId } from '/@/types/entity-ids'

import GroupUser from './GroupUser.vue'

const props = defineProps<{
  groupId: UserGroupId
  admins: UserId[]
}>()

const { pushModal } = useModalStore()
const { addErrorToast } = useToastStore()

const onClickAdd = () => {
  pushModal({
    type: 'group-admin-add',
    id: props.groupId
  })
}

const onDelete = async (id: string) => {
  if (!confirm('本当にこのグループ管理者を削除しますか？')) return
  try {
    await apis.removeUserGroupAdmin(props.groupId, id)
  } catch {
    addErrorToast('グループ管理者の削除に失敗しました')
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
.count {
  margin-left: 0.2em;
  overflow: hidden;
  display: inline-flex;
  &::before {
    content: '(';
    display: block;
  }
  &::after {
    content: ')';
    display: block;
  }
}
.addIcon {
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
</style>
