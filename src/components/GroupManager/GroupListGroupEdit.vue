<template>
  <div :class="$style.container">
    <line-editor
      :class="$style.item"
      label="グループ名"
      :value="group.name"
      :max-length="30"
      @update="onNameUpdate"
    />
    <line-editor
      :class="$style.item"
      label="説明"
      :value="group.description"
      :max-length="100"
      @update="onDescUpdate"
    />
    <line-editor
      :class="$style.item"
      label="タイプ"
      :value="group.type"
      :max-length="30"
      @update="onTypeUpdate"
    />
    <group-admin-list
      :class="$style.item"
      :group-id="group.id"
      :admins="group.admins"
    />
    <group-member-list
      :class="$style.item"
      :group-id="group.id"
      :members="group.members"
    />
    <div :class="[$style.item, $style.deleteButtonWrapper]">
      <form-button label="グループを削除" color="error" @click="onDelete" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { UserGroup } from '@traptitech/traq'
import LineEditor from './LineEditor.vue'
import apis from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import GroupAdminList from './GroupAdminList.vue'
import GroupMemberList from './GroupMemberList.vue'
import FormButton from '/@/components/UI/FormButton.vue'

export default defineComponent({
  name: 'GroupListGroupEdit',
  components: {
    LineEditor,
    GroupAdminList,
    GroupMemberList,
    FormButton
  },
  props: {
    group: {
      type: Object as PropType<UserGroup>,
      required: true
    }
  },
  setup(props) {
    const { addErrorToast } = useToastStore()

    const onUpdate = (key: keyof UserGroup) => async (value: string) => {
      try {
        await apis.editUserGroup(props.group.id, { [key]: value })

        // TODO: wsがつながっていないことがある
      } catch {
        addErrorToast('グループの変更に失敗しました')
      }
    }
    const onNameUpdate = onUpdate('name')
    const onDescUpdate = onUpdate('description')
    const onTypeUpdate = onUpdate('type')

    const onDelete = async () => {
      if (!confirm('本当にこのグループを削除しますか？')) return

      try {
        await apis.deleteUserGroup(props.group.id)

        // TODO: wsがつながっていないことがある
      } catch {
        addErrorToast('グループの削除に失敗しました')
      }
    }

    return { onNameUpdate, onDescUpdate, onTypeUpdate, onDelete }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  padding: 16px 24px;
  border-radius: 8px;
}
.item {
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.deleteButtonWrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
