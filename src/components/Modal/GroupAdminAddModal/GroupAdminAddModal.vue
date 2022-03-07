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

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue'
import ModalFrame from '../Common/ModalFrame.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import apis from '/@/lib/apis'
import store from '/@/vuex'
import useToastStore from '/@/providers/toastStore'
import { UserGroupId, UserId } from '/@/types/entity-ids'
import UsersSelector from '../Common/UsersSelector.vue'

export default defineComponent({
  name: 'GroupAdminAddModal',
  components: {
    ModalFrame,
    FormButton,
    UsersSelector
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

      await store.dispatch.ui.modal.popModal()
    }

    return { groupName, admins, userIds, isAdding, add }
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
  height: 280px;
  max-height: 100%;
}
.addButtonWrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
