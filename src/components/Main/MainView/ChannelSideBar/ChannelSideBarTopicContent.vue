<template>
  <div :class="$style.container" :style="styles.container">
    <span :class="$style.topic">
      {{
        props.topicContent === '' || !props.topicContent
          ? 'トピック未設定'
          : props.topicContent
      }}
    </span>
    <icon :class="$style.icon" width="20" height="20" name="pencil" mdi />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

type Props = {
  topicContent: string
  isOpen: boolean
}

const useStyles = (props: Props) =>
  reactive({
    container: makeStyles(theme => ({
      color: props.topicContent === '' ? theme.ui.secondary : theme.ui.primary
    })),
    topic: makeStyles(theme => ({
      opacity: props.topicContent === '' ? '50%' : '100%'
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarTopicContent',
  components: { Icon },
  props: {
    topicContent: { type: String },
    isOpen: { type: Boolean, required: true }
  },
  setup(props: Props) {
    const styles = useStyles(props)
    return {
      styles,
      props
    }
  }
})
</script>

<style lang="scss" module>
$topicSize: 1.15rem;

.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  user-select: none;
  width: 240px;
}

.topic {
  font-size: $topicSize;
  font-weight: bold;
  user-select: none;
  word-break: break-all;
  max-width: 220px;
  margin: 8px 0;
}

.icon {
  margin-top: 8px;
}
</style>
