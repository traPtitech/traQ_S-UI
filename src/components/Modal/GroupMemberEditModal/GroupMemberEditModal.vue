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

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue'
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '@/components/UI/FormInput.vue'
import FormButton from '@/components/UI/FormButton.vue'
import apis from '@/lib/apis'
import store from '@/store'
import useToastStore from '@/providers/toastStore'
import { UserGroupId, UserId } from '@/types/entity-ids'

export default defineComponent({
  name: 'GroupMemberEditModal',
  components: {
    ModalFrame,
    FormInput,
    FormButton
  },
  props: {
    groupId: {
      type: String as PropType<UserGroupId>,
      required: true
    },
    userId: {
      type: String as PropType<UserId>,
      required: true
    }
  },
  setup(props) {
    const { addErrorToast } = useToastStore()

    const group = computed(() =>
      store.state.entities.userGroupsMap.get(props.groupId)
    )

    const groupName = computed(() => group.value?.name)
    const userDisplayName = computed(
      () => store.state.entities.usersMap.get(props.userId)?.displayName ?? ''
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

      await store.dispatch.ui.modal.popModal()
    }

    return { groupName, userDisplayName, role, edit }
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
.editButtonWrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
