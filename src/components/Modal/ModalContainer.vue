<template>
  <transition name="background-shadow">
    <div v-if="modalState.shouldShowModal" :class="$style.container">
      <component
        :is="component"
        :id="
          modalState.current.type === 'user' ||
          modalState.current.type === 'tag' ||
          modalState.current.type === 'group' ||
          modalState.current.type === 'file' ||
          modalState.current.type === 'channel-manage' ||
          modalState.current.type === 'group-admin-add'
            ? modalState.current.id
            : undefined
        "
        :parent-channel-id="
          modalState.current.type === 'channel-create'
            ? modalState.current.parentChannelId
            : undefined
        "
        :message-id="
          modalState.current.type === 'clip-create'
            ? modalState.current.messageId
            : undefined
        "
        :group-id="
          modalState.current.type === 'group-member-edit'
            ? modalState.current.groupId
            : undefined
        "
        :user-id="
          modalState.current.type === 'group-member-edit'
            ? modalState.current.userId
            : undefined
        "
      />
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, defineAsyncComponent } from 'vue'
import store from '@/store'
import { ModalState } from '@/store/ui/modal/state'

const modalComponentMap: Record<ModalState['type'], string> = {
  user: 'UserModal/UserModal',
  notification: 'NotificationModal/NotificationModal',
  tag: 'TagModal/TagModal',
  group: 'GroupModal/GroupModal',
  'channel-create': 'ChannelCreateModal/ChannelCreateModal',
  file: 'FileModal/FileModal',
  qrcode: 'QRCodeModal/QRCodeModal',
  'clip-create': 'ClipCreateModal/ClipCreateModal',
  'clip-folder-create': 'ClipFolderCreateModal/ClipFolderCreateModal',
  'channel-manage': 'ChannelManageModal/ChannelManageModal',
  'group-create': 'GroupCreateModal/GroupCreateModal',
  'group-member-edit': 'GroupMemberEditModal/GroupMemberEditModal',
  'group-admin-add': 'GroupAdminAddModal/GroupAdminAddModal'
}

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

    // ここでpathを束縛することでcomputed内で戻り値の関数がpathに依存していることが伝わる？
    const getComponent = (path: string) =>
      defineAsyncComponent(() => import(`@/components/Modal/${path}.vue`))

    const component = computed(() =>
      getComponent(modalComponentMap[modalState.current.type])
    )

    return {
      modalState,
      component
    }
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
  background-color: rgba(0, 0, 0, 0.15);
  transition: background-color 0.1s;
  z-index: $z-index-modal-container;
  contain: strict;
}
</style>
