<template>
  <ModalFrame title="グループ作成" icon-name="group">
    <FormInput
      v-model="name"
      :class="$style.item"
      label="グループ名"
      :max-length="30"
      :error-message="errorMessage"
      focus-on-mount
      @input="validateName"
    />
    <FormInput
      v-model="desc"
      :class="$style.item"
      label="説明"
      :max-length="100"
    />
    <FormInput
      v-model="type"
      :class="$style.item"
      label="タイプ"
      :max-length="30"
    />
    <FormCheckbox
      v-model="addMember"
      :class="[$style.item, $style.memberCheckbox]"
    >
      自分自身をメンバーに追加する
    </FormCheckbox>
    <div :class="$style.createButtonWrapper">
      <FormButton
        :disabled="!name || !!errorMessage"
        label="作成"
        @click="create"
      />
    </div>
  </ModalFrame>
</template>

<script lang="ts" setup>
import { AxiosError } from 'axios'
import { ref } from 'vue'
import ModalFrame from '../Common/ModalFrame.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import FormCheckbox from '/@/components/UI/FormCheckbox.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import apis from '/@/lib/apis'
import { useMeStore } from '/@/store/domain/me'
import { useModalStore } from '/@/store/ui/modal'
import { useToastStore } from '/@/store/ui/toast'

const { myId } = useMeStore()
const { addErrorToast } = useToastStore()
const { popModal } = useModalStore()

const name = ref('')
const desc = ref('')
const type = ref('')
const addMember = ref(true)
const errorMessage = ref<string | null>(null)

// eslint-disable-next-line no-irregular-whitespace
const VALID_REG_EXP = /^[^@＠#＃:： 　]*$/ // @, #, :, 空白 (全角・半角) は使用不可

const validateName = () => {
  if (!VALID_REG_EXP.test(name.value)) {
    errorMessage.value = '「@」「#」「:」と空白は使用できません'
  } else {
    errorMessage.value = null
  }
}

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
