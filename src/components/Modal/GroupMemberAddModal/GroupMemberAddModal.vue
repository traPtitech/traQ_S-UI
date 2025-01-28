<template>
  <modal-frame
    title="グループメンバー追加"
    :subtitle="groupName"
    icon-name="group"
  >
    <users-selector
      v-model="userIds"
      :exclude-ids="members"
      :class="[$style.users, $style.item]"
    />
    <form-input
      v-model="role"
      :class="$style.item"
      label="役割"
      :max-length="30"
    />
    <div :class="$style.addButtonWrapper">
      <form-button label="追加" :loading="isAdding" @click="add" />
    </div>
  </modal-frame>
</template>

<script lang="ts" setup>
import ModalFrame from '../Common/ModalFrame.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import UsersSelector from '../Common/UsersSelector.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import { computed, ref } from 'vue'
import apis from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import type { UserGroupId, UserId } from '/@/types/entity-ids'
import { useModalStore } from '/@/store/ui/modal'
import { useGroupsStore } from '/@/store/entities/groups'

const props = defineProps<{
  id: UserGroupId
}>()

const { addErrorToast } = useToastStore()
const { popModal } = useModalStore()
const { userGroupsMap } = useGroupsStore()

const group = computed(() => userGroupsMap.value.get(props.id))
const groupName = computed(() => group.value?.name)
const members = computed(() => group.value?.members.map(m => m.id) ?? [])

const userIds = ref(new Set<UserId>())
const role = ref('')

const isAdding = ref(false)
const add = async () => {
  isAdding.value = true
  const reqIds = Array.from(userIds.value)
  try {
    await apis.addUserGroupMember(
      props.id,
      reqIds.map(id => ({ id, role: role.value }))
    )
  } catch {
    addErrorToast('グループメンバーの追加に失敗しました')
  }
  isAdding.value = false

  await popModal()
}
</script>

<style lang="scss" module>
.item {
  margin: 8px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.users {
  height: 240px;
  max-height: 100%;
}
.addButtonWrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
