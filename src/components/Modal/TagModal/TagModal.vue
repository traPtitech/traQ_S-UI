<template>
  <modal-frame
    title="タグ"
    :subtitle="tagName"
    icon-mdi
    icon-name="tag"
    return-button
  >
    <user-list-item
      v-for="userId in taggedUsers"
      :key="userId"
      :user-id="userId"
      :class="$style.item"
    />
  </modal-frame>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  watchEffect,
  onMounted,
  onBeforeUnmount
} from 'vue'
import store from '/@/store'
import ModalFrame from '../Common/ModalFrame.vue'
import UserListItem from '../Common/UserListItem.vue'
import { Tag } from '@traptitech/traq'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import { UserTagsUpdatedEvent } from '/@/lib/websocket/events'

const useTag = (props: { id: string }) => {
  const tag = ref<Tag | null>()
  const fetchTag = async () => {
    tag.value = (await apis.getTag(props.id)).data
  }
  const onTagsUpdated = ({ tag_id }: UserTagsUpdatedEvent) => {
    if (tag_id !== props.id) return
    fetchTag()
  }

  watchEffect(fetchTag)
  onMounted(() => {
    wsListener.on('USER_TAGS_UPDATED', onTagsUpdated)
  })
  onBeforeUnmount(() => {
    wsListener.off('USER_TAGS_UPDATED', onTagsUpdated)
  })

  return tag
}

export default defineComponent({
  name: 'TagModal',
  components: {
    ModalFrame,
    UserListItem
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const tag = useTag(props)
    const tagName = computed(() => tag.value?.tag)
    const taggedUsers = computed(
      () =>
        tag.value?.users.filter(user =>
          store.getters.entities.activeUsersMap.has(user)
        ) ?? []
    )
    return { tagName, taggedUsers }
  }
})
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
</style>
