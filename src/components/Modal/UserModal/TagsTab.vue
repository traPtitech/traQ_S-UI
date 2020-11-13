<template>
  <div :class="$style.tags">
    <template v-if="detail === undefined">Now loading...</template>
    <template v-else>
      <ul :class="$style.list">
        <tags-tab-tag
          v-for="tag in tags"
          :class="$style.tag"
          :key="tag.tagId"
          :tag="tag"
          :user-id="userId"
          :is-mine="isMine"
        />
      </ul>
      <tags-tab-add :user-id="userId" />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import store from '@/store'
import { UserDetail } from '@traptitech/traq'
import TagsTabTag from '@/components/Modal/UserModal/TagsTabTag.vue'
import TagsTabAdd from '@/components/Modal/UserModal/TagsTabAdd.vue'

export default defineComponent({
  name: 'TagsTab',
  props: {
    detail: Object as PropType<UserDetail>
  },
  setup(props) {
    const userId = computed(() => props.detail?.id)
    const isMine = computed(
      () => userId.value === store.state.domain.me.detail?.id
    )
    const tags = computed(() => props.detail?.tags ?? [])

    return {
      userId,
      isMine,
      tags
    }
  },
  components: {
    TagsTabTag,
    TagsTabAdd
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
