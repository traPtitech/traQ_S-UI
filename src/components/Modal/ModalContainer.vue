<template>
  <transition name="background-shadow">
    <div v-if="shouldShowModal && currentState" :class="$style.container">
      <component
        :is="component"
        :id="
          currentState.type === 'user' ||
          currentState.type === 'tag' ||
          currentState.type === 'group' ||
          currentState.type === 'file' ||
          currentState.type === 'channel-manage' ||
          currentState.type === 'group-admin-add' ||
          currentState.type === 'group-member-add'
            ? currentState.id
            : undefined
        "
        :parent-channel-id="
          currentState.type === 'channel-create'
            ? currentState.parentChannelId
            : undefined
        "
        :message-id="
          currentState.type === 'clip-create'
            ? currentState.messageId
            : undefined
        "
        :group-id="
          currentState.type === 'group-member-edit'
            ? currentState.groupId
            : undefined
        "
        :user-id="
          currentState.type === 'group-member-edit'
            ? currentState.userId
            : undefined
        "
      />
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, computed, defineAsyncComponent } from 'vue'
import { ModalState } from '/@/store/ui/modal/states'
import { useModalStore } from '/@/store/ui/modal'

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
  'group-admin-add': 'GroupAdminAddModal/GroupAdminAddModal',
  'group-member-add': 'GroupMemberAddModal/GroupMemberAddModal'
}

const modalModules = import.meta.glob('/src/components/Modal/*/*Modal.vue')

export default defineComponent({
  name: 'ModalContainer',
  setup() {
    const { shouldShowModal, currentState } = useModalStore()

    // ここでpathを束縛することでcomputed内で戻り値の関数がpathに依存していることが伝わる？
    const getComponent = (path: string) =>
      defineAsyncComponent(() =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        modalModules[`/src/components/Modal/${path}.vue`]!()
      )

    const component = computed(() =>
      currentState.value
        ? getComponent(modalComponentMap[currentState.value.type])
        : undefined
    )

    return {
      shouldShowModal,
      currentState,
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
