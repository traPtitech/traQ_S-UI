<template>
  <div :class="$style.tags" :style="styles.tags">
    <template v-if="props.detail === undefined">Now loading...</template>
    <template v-else>
      <ul :class="$style.list">
        <li
          v-for="tag in tags"
          :key="tag.tagId"
          :class="$style.tag"
          @click="onTagClick"
        >
          <icon name="tag" mdi :class="$style.icon" :size="20" />
          {{ tag.tag }}
        </li>
      </ul>
      <tags-tab-add :userId="props.detail.id" />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import { UserDetail } from '@traptitech/traq'
import Icon from '@/components/UI/Icon.vue'
import TagsTabAdd from '@/components/Main/Modal/UserModal/TagsTabAdd.vue'

const useStyles = () =>
  reactive({
    tags: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

interface Props {
  detail?: UserDetail
}

export default defineComponent({
  name: 'TagsTab',
  props: {
    detail: Object
  },
  setup(props: Props) {
    const styles = useStyles()
    const tags = computed(() => props.detail?.tags ?? [])

    const onTagClick = () => {
      // TODO: Open tag modal
    }

    return { styles, props, tags, onTagClick }
  },
  components: {
    Icon,
    TagsTabAdd
  }
})
</script>

<style lang="scss" module>
.tags {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.list {
  overflow-y: scroll;
  flex: 1 1;
}

.tag {
  margin: 16px 8px;
}

.icon {
  vertical-align: bottom;
  margin-right: 4px;
}
</style>
