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
import { computed, ref, watchEffect } from 'vue'
import { Tag } from '@traptitech/traq'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import { useUsersStore } from '/@/store/entities/users'
import useMittListener from '/@/composables/utils/useMittListener'

const useTag = (props: { id: string }) => {
  const tag = ref<Tag | null>()
  const fetchTag = async () => {
    tag.value = (await apis.getTag(props.id)).data
  }

  watchEffect(fetchTag)

  useMittListener(wsListener, 'USER_TAGS_UPDATED', ({ tag_id }) => {
    if (tag_id !== props.id) return
    fetchTag()
  })

  return tag
}
</script>

<script lang="ts" setup>
import ModalFrame from '../Common/ModalFrame.vue'
import UserListItem from '../Common/UserListItem.vue'

const props = defineProps<{
  id: string
}>()

const { activeUsersMap } = useUsersStore()

const tag = useTag(props)
const tagName = computed(() => tag.value?.tag)
const taggedUsers = computed(
  () => tag.value?.users.filter(user => activeUsersMap.value.has(user)) ?? []
)
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
