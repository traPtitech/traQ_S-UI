<template>
  <modal-frame title="グループ作成" icon-name="group">
    <form-input
      v-model="name"
      :class="$style.item"
      label="グループ名"
      :max-length="30"
      focus-on-mount
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
    >
      自分自身をメンバーに追加する
    </form-checkbox>
    <div :class="$style.createButtonWrapper">
      <form-button label="作成" @click="create" />
    </div>
  </modal-frame>
</template>

<script lang="ts" setup>
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import FormCheckbox from '/@/components/UI/FormCheckbox.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { ref } from 'vue'
import apis from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import { useModalStore } from '/@/store/ui/modal'
import { useMeStore } from '/@/store/domain/me'
import { AxiosError } from 'axios'

const { myId } = useMeStore()
const { addErrorToast } = useToastStore()
const { popModal } = useModalStore()

const name = ref('')
const desc = ref('')
const type = ref('')
const addMember = ref(true)

const create = async () => {
  const myIdV = myId.value
  if (!myIdV) return

  try {
    const { data: group } = await apis.createUserGroup({
      name: name.value,
      description: desc.value,
      type: type.value
    })
    if (addMember.value) {
      await apis.addUserGroupMember(group.id, { id: myIdV, role: '' })
    }
    await popModal()
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 409) {
      addErrorToast('既に同じ名前のグループが存在しています')
    } else {
      addErrorToast('グループの作成に失敗しました')
    }
  }
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
.memberCheckbox {
  @include color-ui-secondary;
}
.createButtonWrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
