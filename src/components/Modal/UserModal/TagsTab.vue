<template>
  <div :class="$style.tags">
    <template v-if="detail === undefined">Now loading...</template>
    <template v-else>
      <ul :class="$style.list">
        <tags-tab-tag
          v-for="tag in tags"
          :key="tag.tagId"
          :class="$style.tag"
          :tag="tag"
          :user-id="detail.id"
          :is-mine="isMine"
        />
      </ul>
      <tags-tab-add :user-id="detail.id" />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { UserDetail } from '@traptitech/traq'
import TagsTabTag from '/@/components/Modal/UserModal/TagsTabTag.vue'
import TagsTabAdd from '/@/components/Modal/UserModal/TagsTabAdd.vue'
import { useMeStore } from '/@/store/domain/me'

export default defineComponent({
  name: 'TagsTab',
  components: {
    TagsTabTag,
    TagsTabAdd
  },
  props: {
    detail: {
      type: Object as PropType<UserDetail>,
      default: undefined
    }
  },
  setup(props) {
    const { myId } = useMeStore()
    const isMine = computed(() => props.detail?.id === myId.value)
    const tags = computed(() => props.detail?.tags ?? [])

    return { isMine, tags }
  }
})
</script>

<style lang="scss" module>
.tags {
  @include color-ui-primary;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.list {
  overflow-y: scroll;
  flex: 1 1;
}

.tag {
  margin: 8px 4px;
  &:first-child {
    // ナビゲーションと頭を揃える
    margin-top: 0;
  }
}
</style>
