<template>
  <modal-frame
    title="グループメンバー編集"
    :subtitle="`${groupName} - ${userDisplayName}`"
    icon-name="group"
  >
    <form-input
      v-model="role"
      :class="$style.item"
      label="役割"
      :max-length="30"
    />
    <div :class="$style.editButtonWrapper">
      <form-button label="編集" @click="edit" />
    </div>
  </modal-frame>
</template>

<script lang="ts" setup>
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { computed, ref } from 'vue'
import apis from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import { UserGroupId, UserId } from '/@/types/entity-ids'
import { useModalStore } from '/@/store/ui/modal'
import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
  groupId: UserGroupId
  userId: UserId
}>()

const { addErrorToast } = useToastStore()
const { popModal } = useModalStore()
const { userGroupsMap } = useGroupsStore()
const { usersMap } = useUsersStore()

const group = computed(() => userGroupsMap.value.get(props.groupId))

const groupName = computed(() => group.value?.name)
const userDisplayName = computed(
  () => usersMap.value.get(props.userId)?.displayName ?? ''
)

const role = ref(
  group.value?.members.find(m => m.id === props.userId)?.role ?? ''
)

const edit = async () => {
  try {
    await apis.editUserGroupMember(props.groupId, props.userId, {
      role: role.value
    })
  } catch {
    addErrorToast('グループメンバーの編集に失敗しました')
  }

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
.editButtonWrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
