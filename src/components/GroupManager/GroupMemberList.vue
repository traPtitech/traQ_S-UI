<template>
  <div>
    <div :class="$style.header">
      <div :class="$style.label">メンバー</div>
      <icon
        name="plus-circle-outline"
        mdi
        :class="$style.addIcon"
        @click="onClickAdd"
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
        <div :class="$style.role">{{ member.role }}</div>
      </group-user>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { UserGroupId } from '@/types/entity-ids'
import Icon from '@/components/UI/Icon.vue'
import GroupUser from './GroupUser.vue'
import apis from '@/lib/apis'
import useToastStore from '@/providers/toastStore'
import { UserGroupMember } from '@traptitech/traq'
import store from '@/store'

export default defineComponent({
  name: 'GroupMemberList',
  components: {
    Icon,
    GroupUser
  },
  props: {
    groupId: {
      type: String as PropType<UserGroupId>,
      required: true
    },
    members: {
      type: Array as PropType<UserGroupMember[]>,
      required: true
    }
  },
  setup(props) {
    const { addErrorToast } = useToastStore()

    const onClickAdd = () => {
      store.dispatch.ui.modal.pushModal({
        type: 'group-member-add',
        id: props.groupId
      })
    }

    const onEdit = async (id: string) => {
      await store.dispatch.ui.modal.pushModal({
        type: 'group-member-edit',
        groupId: props.groupId,
        userId: id
      })
    }

    const onDelete = async (id: string) => {
      if (!confirm('本当にこのメンバーを削除しますか？')) return
      try {
        await apis.removeUserGroupMember(props.groupId, id)

        // TODO: wsがつながっていないことがある
      } catch {
        addErrorToast('メンバーの削除に失敗しました')
      }
    }

    return { onClickAdd, onEdit, onDelete }
  }
})
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
.addIcon {
  @include color-ui-primary;
  cursor: pointer;
  opacity: 0.5;
  &:hover {
    opacity: 1;
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
