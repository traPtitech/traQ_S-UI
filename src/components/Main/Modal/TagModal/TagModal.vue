<template>
  <modal-frame
    title="タグ"
    :subtitle="tagName"
    icon-mdi
    icon-name="tag"
    return-button
  >
    <user-list-item
      v-for="id in taggedUsers"
      :key="id"
      :user-id="id"
      :class="$style.item"
    />
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import ModalFrame from '../Common/ModalFrame.vue'
import UserListItem from '../Common/UserListItem.vue'

export default defineComponent({
  name: 'TagModal',
  components: {
    ModalFrame,
    UserListItem
  },
  props: {
    tagId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    store.dispatch.entities.fetchTag(props.tagId)
    const tag = computed(() => store.state.entities.tags[props.tagId])
    const tagName = computed(() => tag.value?.tag)
    const taggedUsers = computed(() => tag.value?.users ?? [])
    return { tagName, taggedUsers }
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
