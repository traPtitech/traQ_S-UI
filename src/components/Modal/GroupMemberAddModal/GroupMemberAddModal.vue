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

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue'
import ModalFrame from '../Common/ModalFrame.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import apis from '/@/lib/apis'
import store from '/@/store'
import useToastStore from '/@/providers/toastStore'
import { UserGroupId, UserId } from '/@/types/entity-ids'
import UsersSelector from '../Common/UsersSelector.vue'
import FormInput from '/@/components/UI/FormInput.vue'

export default defineComponent({
  name: 'GroupMemberAddModal',
  components: {
    ModalFrame,
    FormButton,
    UsersSelector,
    FormInput
  },
  props: {
    id: {
      type: String as PropType<UserGroupId>,
      required: true
    }
  },
  setup(props) {
    const { addErrorToast } = useToastStore()

    const group = computed(() =>
      store.state.entities.userGroupsMap.get(props.id)
    )
    const groupName = computed(() => group.value?.name)
    const members = computed(() => group.value?.members.map(m => m.id) ?? [])

    const userIds = ref(new Set<UserId>())
    const role = ref('')

    const isAdding = ref(false)
    const add = async () => {
      isAdding.value = true
      try {
        for (const userId of userIds.value) {
          await apis.addUserGroupMember(props.id, {
            id: userId,
            role: role.value
          })
        }
      } catch {
        addErrorToast('グループメンバーの追加に失敗しました')
      }
      isAdding.value = false

      await store.dispatch.ui.modal.popModal()
    }

    return { groupName, members, userIds, role, isAdding, add }
  }
})
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
