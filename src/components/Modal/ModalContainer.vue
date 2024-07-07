<template>
  <transition name="background-shadow">
    <div v-if="shouldShowModal && currentState" :class="$style.container">
      <component
        :is="component"
        v-if="component"
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
        :key="currentState.type === 'user' ? currentState.id : undefined"
        :channel-id="
          currentState.type === 'notification'
            ? currentState.channelId
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

<script lang="ts" setup>
import { type Component, computed } from 'vue'
import { useModalStore } from '/@/store/ui/modal'
import UserModal from './UserModal/UserModal.vue'
import NotificationModal from './NotificationModal/NotificationModal.vue'
import TagModal from './TagModal/TagModal.vue'
import GroupModal from './GroupModal/GroupModal.vue'
import ChannelCreateModal from './ChannelCreateModal/ChannelCreateModal.vue'
import FileModal from './FileModal/FileModal.vue'
import QRCodeModal from './QRCodeModal/QRCodeModal.vue'
import ClipCreateModal from './ClipCreateModal/ClipCreateModal.vue'
import ClipFolderCreateModal from './ClipFolderCreateModal/ClipFolderCreateModal.vue'
import ChannelManageModal from './ChannelManageModal/ChannelManageModal.vue'
import GroupCreateModal from './GroupCreateModal/GroupCreateModal.vue'
import GroupMemberEditModal from './GroupMemberEditModal/GroupMemberEditModal.vue'
import GroupAdminAddModal from './GroupAdminAddModal/GroupAdminAddModal.vue'
import GroupMemberAddModal from './GroupMemberAddModal/GroupMemberAddModal.vue'
import SettingsThemeEditModal from './SettingsThemeEditModal/SettingsThemeEditModal.vue'
import type { ModalStateType } from '/@/store/ui/modal/states'

const { shouldShowModal, currentState } = useModalStore()

const components: Record<ModalStateType, Component> = {
  user: UserModal,
  notification: NotificationModal,
  tag: TagModal,
  group: GroupModal,
  'channel-create': ChannelCreateModal,
  file: FileModal,
  qrcode: QRCodeModal,
  'clip-create': ClipCreateModal,
  'clip-folder-create': ClipFolderCreateModal,
  'channel-manage': ChannelManageModal,
  'group-create': GroupCreateModal,
  'group-member-edit': GroupMemberEditModal,
  'group-admin-add': GroupAdminAddModal,
  'group-member-add': GroupMemberAddModal,
  'settings-theme-edit': SettingsThemeEditModal
}
const component = computed(() => {
  if (currentState.value) {
    return components[currentState.value.type]
  } else {
    // eslint-disable-next-line no-console
    console.error('Unexpected modal type:', currentState.value)
    return undefined
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
