<template>
  <modal-frame
    title="クリップ"
    :subtitle="messageContent"
    icon-mdi
    icon-name="bookmark"
  >
    <div v-for="clipFolder in clipFolders" :key="clipFolder.id">
      {{ clipFolder.name }}
    </div>
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import ModalFrame from '../Common/ModalFrame.vue'
import UserListItem from '../Common/UserListItem.vue'
import { compareString } from '@/lib/util/string'

export default defineComponent({
  name: 'ClipCreateModal',
  components: {
    ModalFrame,
    UserListItem
  },
  props: {
    messageId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const message = computed(
      () => store.state.entities.messages[props.messageId]
    )
    const clipFolders = computed(() => {
      const folders = Object.values(store.state.entities.clipFolders)
      folders.sort((a, b) => compareString(a?.name, b?.name))
      return folders
    })
    const messageContent = computed(() => message.value?.content ?? '')
    return { messageContent, clipFolders }
  }
})
</script>

<style lang="scss" module>
.item {
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
