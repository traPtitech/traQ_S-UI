<template>
  <div :class="$style.container" :style="styles.container">
    <icon name="close" mdi @click="removeTag" :size="24" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'

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
      me: store.state.domain.me.detail
    })
    const isMine = () => {
      return props.userId === state.me?.id
    }

    const removeTag = async () => {
      if (isMine()) {
        await apis.removeMyUserTag(props.tagId)
      } else {
        await apis.removeUserTag(props.userId, props.tagId)
      }
    }
    return { styles, removeTag }
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
