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
    <group-admin-list :group-id="group.id" :admins="group.admins" />
    <div :class="$style.adminList">
      <user-icon-ellipsis-list
        direction="row"
        :user-ids="group.members.map(m => m.id)"
        prevent-modal
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { UserGroup } from '@traptitech/traq'
import LineEditor from './LineEditor.vue'
import UserIconEllipsisList from '@/components/UI/UserIconEllipsisList.vue'
import apis from '@/lib/apis'
import useToastStore from '@/providers/toastStore'
import GroupAdminList from './GroupAdminList.vue'

export default defineComponent({
  name: 'GroupListGroupEdit',
  components: {
    LineEditor,
    UserIconEllipsisList,
    GroupAdminList
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

    return { onNameUpdate, onDescUpdate, onTypeUpdate }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  padding: 8px 16px;
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
</style>
