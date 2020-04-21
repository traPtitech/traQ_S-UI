<template>
  <div v-if="modalState.shouldShowModal" :class="$style.container">
    <setting-modal v-if="modalState.current.type === 'setting'" />
    <user-modal
      v-else-if="modalState.current.type === 'user'"
      :id="modalState.current.id"
    />
    <notification-modal
      v-else-if="modalState.current.type === 'notification'"
    />
    <group-modal
      v-else-if="modalState.current.type === 'group'"
      :group-id="modalState.current.id"
    />
    <tag-modal
      v-else-if="modalState.current.type === 'tag'"
      :tag-id="modalState.current.id"
    />
    <channel-create-modal
      v-else-if="modalState.current.type === 'channel-create'"
      :parent-channel-id="modalState.current.parentChannelId"
    />
    <file-modal
      v-else-if="modalState.current.type === 'file'"
      :file-id="modalState.current.id"
    />
    <qr-code-modal v-else-if="modalState.current.type === 'qrcode'" />
    <div v-else :class="$style.modal" :style="styles.modal">
      <pre>
        {{ (modalState.currentJson) }}
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
import NotificationModal from '@/components/Main/Modal/NotificationModal/NotificationModal.vue'
import TagModal from '@/components/Main/Modal/TagModal/TagModal.vue'
import GroupModal from '@/components/Main/Modal/GroupModal/GroupModal.vue'
import ChannelCreateModal from '@/components/Main/Modal/ChannelCreateModal/ChannelCreateModal.vue'
import FileModal from '@/components/Main/Modal/FileModal/FileModal.vue'
import QrCodeModal from '@/components/Main/Modal/QRCodeModal/QRCodeModal.vue'

const useModal = () => {
  const state = reactive({
    shouldShowModal: computed(() => store.getters.ui.modal.shouldShowModal),
    current: computed(() => store.getters.ui.modal.currentState),
    currentJson: computed(() =>
      JSON.stringify(store.getters.ui.modal.currentState)
    )
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
    const onClickPop = () => {
      if (store.state.ui.modal.isOnInitialModalRoute) {
        store.dispatch.ui.modal.closeModal()
      } else {
        store.dispatch.ui.modal.popModal()
      }
    }
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
    UserModal,
    NotificationModal,
    GroupModal,
    TagModal,
    ChannelCreateModal,
    FileModal,
    QrCodeModal
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
