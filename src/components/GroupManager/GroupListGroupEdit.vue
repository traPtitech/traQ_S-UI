<template>
  <div :class="$style.container">
    <line-editor
      v-model="name"
      :class="$style.item"
      label="グループ名"
      :max-length="30"
    />
    <line-editor
      v-model="description"
      :class="$style.item"
      label="説明"
      :max-length="100"
    />
    <line-editor
      v-model="type"
      :class="$style.item"
      label="タイプ"
      :max-length="30"
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
      <form-button
        label="グループを削除"
        type="secondary"
        is-danger
        @click="onDelete"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import LineEditor from './LineEditor.vue'
import GroupAdminList from './GroupAdminList.vue'
import GroupMemberList from './GroupMemberList.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import type { UserGroup } from '@traptitech/traq'
import apis from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import { computed } from 'vue'

const props = defineProps<{
  group: UserGroup
}>()

const { addErrorToast } = useToastStore()

const update = async (key: keyof UserGroup, value: string) => {
  try {
    await apis.editUserGroup(props.group.id, { [key]: value })
  } catch {
    addErrorToast('グループの変更に失敗しました')
  }
}

const name = computed<string>({
  get() {
    return props.group.name
  },
  set(v) {
    update('name', v)
  }
})
const description = computed<string>({
  get() {
    return props.group.description
  },
  set(v) {
    update('description', v)
  }
})
const type = computed<string>({
  get() {
    return props.group.type
  },
  set(v) {
    update('type', v)
  }
})

const onDelete = async () => {
  if (!confirm('本当にこのグループを削除しますか？')) return

  try {
    await apis.deleteUserGroup(props.group.id)
  } catch {
    addErrorToast('グループの削除に失敗しました')
  }
}
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
