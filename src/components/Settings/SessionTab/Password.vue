<template>
  <div>
    <h3 :class="$style.header">パスワード変更</h3>
    <p v-if="showChangeLink">
      パスワードの変更は
      <a :href="changeLink" target="_blank">{{ changeName }}</a>
      から可能です
    </p>
    <template v-else>
      <form-input
        v-model="state.old"
        label="現在のパスワード"
        type="password"
        name="current-password"
        autocomplete="current-password"
        :class="$style.form"
      />
      <form-input
        v-model="state.new"
        label="新しいパスワード"
        type="password"
        name="new-password"
        autocomplete="new-password"
        :class="$style.form"
      />
      <div :class="$style.changeButton">
        <form-button
          label="変更"
          :disabled="!isValid"
          :loading="isChanging"
          @click="onChangeClick"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, Ref, ref } from 'vue'
import FormInput from '/@/components/UI/FormInput.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import apis from '/@/lib/apis'
import useToastStore from '/@/providers/toastStore'

interface State {
  old: string
  new: string
}

const usePasswordChange = (state: State, isValid: Ref<boolean>) => {
  const { addSuccessToast, addErrorToast } = useToastStore()
  const isChanging = ref(false)

  const onChangeClick = async () => {
    if (!isValid.value || isChanging.value) return

    try {
      isChanging.value = true
      await apis.changeMyPassword({
        password: state.old,
        newPassword: state.new
      })

      addSuccessToast('パスワードを変更しました')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('パスワードの変更に失敗しました', e)

      addErrorToast('パスワードの変更に失敗しました')
    }
    isChanging.value = false
  }
  return { isChanging, onChangeClick }
}

export default defineComponent({
  name: 'Password',
  components: {
    FormInput,
    FormButton
  },
  setup() {
    const { changeLink, changeName } = window.traQConfig.auth ?? {}
    const showChangeLink = changeLink !== undefined && changeName !== undefined

    const state = reactive<State>({ old: '', new: '' })
    const isValid = computed(
      () => state.old !== '' && state.new !== '' && state.old !== state.new
    )
    const { isChanging, onChangeClick } = usePasswordChange(state, isValid)

    return {
      changeLink,
      changeName,
      showChangeLink,
      state,
      isValid,
      isChanging,
      onChangeClick
    }
  }
})
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.form {
  margin-left: 12px;
}
.changeButton {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
