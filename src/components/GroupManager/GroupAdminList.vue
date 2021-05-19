<template>
  <div>
    <div :class="$style.header">
      <div :class="$style.label">管理者</div>
      <icon
        name="plus-circle-outline"
        mdi
        :class="$style.addIcon"
        @click="onClickAdd"
      />
    </div>
    <div :class="$style.list">
      <group-user
        v-for="admin in admins"
        :id="admin"
        :key="admin"
        @delete="onDelete(admin)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { UserGroupId, UserId } from '@/types/entity-ids'
import Icon from '@/components/UI/Icon.vue'
import GroupUser from './GroupUser.vue'
import apis from '@/lib/apis'
import useToastStore from '@/providers/toastStore'
import store from '@/store'

export default defineComponent({
  name: 'GroupAdminList',
  components: {
    Icon,
    GroupUser
  },
  props: {
    groupId: {
      type: String as PropType<UserGroupId>,
      required: true
    },
    admins: {
      type: Array as PropType<UserId[]>,
      required: true
    }
  },
  setup(props) {
    const { addErrorToast } = useToastStore()

    const onClickAdd = () => {
      store.dispatch.ui.modal.pushModal({
        type: 'group-admin-add',
        id: props.groupId
      })
    }

    const onDelete = async (id: string) => {
      if (!confirm('本当にこのグループ管理者を削除しますか？')) return
      try {
        await apis.removeUserGroupAdmin(props.groupId, id)

        // TODO: wsがつながっていないことがある
      } catch {
        addErrorToast('グループ管理者の削除に失敗しました')
      }
    }

    return { onClickAdd, onDelete }
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
</style>
