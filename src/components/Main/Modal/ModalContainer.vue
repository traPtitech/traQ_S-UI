<template>
  <div v-if="modalState.shouldShowModal" :class="$style.container">
    <setting-modal v-if="modalState.current.type === 'setting'" />
    <user-modal
      v-else-if="modalState.current.type === 'user'"
      :id="modalState.current.id"
    />
    <div v-else :class="$style.modal" :style="styles.modal">
      <pre>
        {{ JSON.stringify(modalState.current) }}
      </pre>
      <div :style="{ display: 'flex' }">
        <button :style="{ padding: '16px' }" @click="onClick">
          push modal
        </button>
        <button :style="{ padding: '16px' }" @click="onClickPop">
          pop modal
        </button>
        <button :style="{ padding: '16px' }" @click="onClickClear">
          clear modal
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import SettingModal from '@/components/Main/Modal/SettingModal/SettingModal.vue'
import UserModal from '@/components/Main/Modal/UserModal/UserModal.vue'

const useModal = () => {
  const state = reactive({
    shouldShowModal: computed(() => store.getters.ui.modal.shouldShowModal),
    current: computed(() => store.getters.ui.modal.currentState)
  })
  window.addEventListener('popstate', event => {
    // history.stateとstoreの同期をとる
    if (event.state?.modalState) {
      store.commit.ui.modal.setState(event.state.modalState)
    } else {
      store.commit.ui.modal.setState([])
    }
  })

  return {
    modalState: state
  }
}

const useStyles = () =>
  reactive({
    modal: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'ModalContainer',
  setup() {
    const { modalState } = useModal()
    const styles = useStyles()
    const onClick = () =>
      store.dispatch.ui.modal.pushModal({
        type: 'user',
        id: 'test'
      })
    const onClickPop = () => store.dispatch.ui.modal.popModal()
    const onClickClear = () => store.dispatch.ui.modal.clearModal()
    return {
      modalState,
      styles,
      onClick,
      onClickPop,
      onClickClear
    }
  },
  components: {
    SettingModal,
    UserModal
  }
})
</script>

<style lang="scss" module>
.container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.15);
}
.modal {
  border-radius: 4px;
  padding: 32px;
}
</style>
