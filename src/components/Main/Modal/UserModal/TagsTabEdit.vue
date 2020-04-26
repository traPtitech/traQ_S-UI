<template>
  <div :class="$style.container" :style="styles.container">
    <icon
      name="lock"
      mdi
      :size="20"
      v-if="state.isLocked"
      @click="toggleTagState"
    />
    <div v-else>
      <icon
        name="lock-open"
        mdi
        :size="20"
        v-if="state.isMine"
        @click="toggleTagState"
        :class="$style.open"
      />
      <icon name="close" mdi @click="removeTag" :size="20" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  PropType,
  computed
} from '@vue/composition-api'

import { makeStyles } from '@/lib/styles'
import { UserId, TagId } from '@/types/entity-ids'
import apis from '@/lib/apis'
import store from '@/store'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'TagsTabEdit',
  components: {
    Icon
  },
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    tagId: {
      type: String as PropType<TagId>,
      required: true
    }
  },
  setup(props) {
    const styles = useStyles()
    const state = reactive({
      isMine: computed(() => store.state.domain.me.detail?.id === props.userId),
      isLocked: computed(
        () =>
          store.state.domain.userDetails[props.userId]?.tags.find(
            tag => tag.tagId === props.tagId
          )?.isLocked ?? false
      )
    })

    const removeTag = async () => {
      if (state.isMine) {
        await apis.removeMyUserTag(props.tagId)
      } else {
        await apis.removeUserTag(props.userId, props.tagId)
      }
    }

    const toggleTagState = async () => {
      if (state.isMine) {
        await apis.editUserTag(props.userId, props.tagId, {
          isLocked: !state.isLocked
        })
        store.dispatch.domain.fetchUserDetail(props.userId)
      }
    }

    return { styles, state, removeTag, toggleTagState }
  }
})
</script>

<style lang="scss" module>
.container {
}
.open {
  margin-right: 4px;
}
</style>
