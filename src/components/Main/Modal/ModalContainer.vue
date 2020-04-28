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
    <clip-create-modal
      v-else-if="modalState.current.type === 'clip-create'"
      :message-id="modalState.current.messageId"
    />
    <clip-folder-create-modal
      v-else-if="modalState.current.type === 'clip-folder-create'"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import SettingModal from '@/components/Main/Modal/SettingModal/SettingModal.vue'
import UserModal from '@/components/Main/Modal/UserModal/UserModal.vue'
import NotificationModal from '@/components/Main/Modal/NotificationModal/NotificationModal.vue'
import TagModal from '@/components/Main/Modal/TagModal/TagModal.vue'
import GroupModal from '@/components/Main/Modal/GroupModal/GroupModal.vue'
import ChannelCreateModal from '@/components/Main/Modal/ChannelCreateModal/ChannelCreateModal.vue'
import FileModal from '@/components/Main/Modal/FileModal/FileModal.vue'
import QrCodeModal from '@/components/Main/Modal/QRCodeModal/QRCodeModal.vue'
import ClipCreateModal from '@/components/Main/Modal/ClipCreateModal/ClipCreateModal.vue'
import ClipFolderCreateModal from '@/components/Main/Modal/ClipFolderCreateModal/ClipFolderCreateModal.vue'

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

export default defineComponent({
  name: 'ModalContainer',
  setup() {
    const { modalState } = useModal()
    return {
      modalState
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
    QrCodeModal,
    ClipCreateModal,
    ClipFolderCreateModal
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
</style>
