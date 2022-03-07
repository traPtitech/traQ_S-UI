<template>
  <li :class="$style.tag" @click="onTagClick">
    <div :class="$style.content">
      <a-icon name="tag" mdi :class="$style.icon" :size="20" />
      <div :class="$style.text">
        {{ tag.tag }}
      </div>
    </div>
    <tags-tab-edit
      :tag-id="tag.tagId"
      :is-mine="isMine"
      :user-id="userId"
      :is-locked="tag.isLocked"
      :class="$style.edit"
    />
  </li>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import store from '/@/vuex'
import { UserTag } from '@traptitech/traq'
import AIcon from '/@/components/UI/AIcon.vue'
import TagsTabEdit from '/@/components/Modal/UserModal/TagsTabEdit.vue'
import { UserId } from '/@/types/entity-ids'
import { useModalStore } from '/@/store/ui/modal'

export default defineComponent({
  name: 'TagsTabTag',
  components: {
    AIcon,
    TagsTabEdit
  },
  props: {
    tag: { type: Object as PropType<UserTag>, required: true },
    isMine: { type: Boolean, default: false },
    userId: { type: String as PropType<UserId>, default: undefined }
  },
  setup(props) {
    const { pushModal } = useModalStore()

    const onTagClick = () => {
      pushModal({
        type: 'tag',
        id: props.tag.tagId
      })
    }

    return { onTagClick }
  }
})
</script>

<style lang="scss" module>
.tag {
  position: relative;
  cursor: pointer;
  display: flex;
  padding: 4px;
  justify-content: space-between;
  align-items: center;

  &:hover::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: $theme-ui-primary-background;
    opacity: 0.1;
  }
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
