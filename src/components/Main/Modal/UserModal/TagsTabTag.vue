<template>
  <li :class="$style.tag">
    <div @click="onTagClick" :class="$style.content">
      <icon name="tag" mdi :class="$style.icon" :size="20" />
      <div :class="$style.text">
        {{ tag.tag }}
      </div>
    </div>
    <tags-tab-edit
      :tag-id="tag.tagId"
      :is-mine="isMine"
      :is-locked="tag.isLocked"
      :class="$style.edit"
    />
  </li>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import store from '@/store'
import { UserTag } from '@traptitech/traq'
import Icon from '@/components/UI/Icon.vue'
import TagsTabEdit from '@/components/Main/Modal/UserModal/TagsTabEdit.vue'

export default defineComponent({
  name: 'TagsTab',
  props: {
    tag: { type: Object as PropType<UserTag>, required: true },
    isMine: { type: Boolean, default: false }
  },
  setup(props) {
    const onTagClick = () => {
      store.dispatch.ui.modal.pushModal({
        type: 'tag',
        id: props.tag.tagId
      })
    }

    return { onTagClick }
  },
  components: {
    Icon,
    TagsTabEdit
  }
})
</script>

<style lang="scss" module>
.tag {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  display: flex;
  align-items: center;
  min-width: 0;
}

.icon {
  margin-right: 8px;
  flex-shrink: 0;
}

.text {
  overflow-wrap: break-word;
  min-width: 0;
}
.edit {
  margin-left: 8px;
  width: 44px;
  flex-shrink: 0;
}
</style>
