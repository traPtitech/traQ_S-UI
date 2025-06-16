<template>
  <modal-frame
    title="グループ管理者追加"
    :subtitle="groupName"
    icon-name="crown"
    icon-mdi
  >
    <users-selector
      v-model="userIds"
      :exclude-ids="admins"
      :class="[$style.users, $style.item]"
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
const admins = computed(() => group.value?.admins ?? [])

const userIds = ref(new Set<UserId>())

const isAdding = ref(false)
const add = async () => {
  isAdding.value = true
  try {
    for (const userId of userIds.value) {
      await apis.addUserGroupAdmin(props.id, { id: userId })
    }
  } catch {
    addErrorToast('グループ管理者の追加に失敗しました')
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
  height: 280px;
  max-height: 100%;
}
.addButtonWrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
