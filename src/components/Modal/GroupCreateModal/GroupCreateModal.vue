<template>
  <modal-frame title="グループ作成" icon-name="group">
    <form-input
      v-model="name"
      :class="$style.item"
      label="グループ名"
      :max-length="30"
    />
    <form-input
      v-model="desc"
      :class="$style.item"
      label="説明"
      :max-length="100"
    />
    <form-input
      v-model="type"
      :class="$style.item"
      label="タイプ"
      :max-length="30"
    />
    <form-checkbox
      v-model="addMember"
      :class="[$style.item, $style.memberCheckbox]"
      label="自分自身をメンバーに追加する"
    />
    <div :class="$style.createButtonWrapper">
      <form-button label="作成" @click="create" />
    </div>
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '@/components/UI/FormInput.vue'
import FormCheckbox from '@/components/UI/FormCheckbox.vue'
import FormButton from '@/components/UI/FormButton.vue'
import apis from '@/lib/apis'
import store from '@/store'
import useToastStore from '@/providers/toastStore'

export default defineComponent({
  name: 'GroupCreateModal',
  components: {
    ModalFrame,
    FormInput,
    FormCheckbox,
    FormButton
  },
  setup() {
    const { addErrorToast } = useToastStore()

    const name = ref('')
    const desc = ref('')
    const type = ref('')
    const addMember = ref(true)

    const create = async () => {
      const myId = store.getters.domain.me.myId
      if (!myId) return

      try {
        const { data: group } = await apis.createUserGroup({
          name: name.value,
          description: desc.value,
          type: type.value
        })
        if (addMember.value) {
          await apis.addUserGroupMember(group.id, { id: myId, role: '' })
        }
      } catch {
        addErrorToast('グループの作成に失敗しました')
      }

      await store.dispatch.ui.modal.popModal()
    }

    return { name, desc, type, addMember, create }
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
.memberCheckbox {
  @include color-ui-secondary;
}
.createButtonWrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
