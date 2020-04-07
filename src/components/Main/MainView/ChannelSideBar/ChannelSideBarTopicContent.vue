<template>
  <div :class="$style.container" :style="styles.container">
    <span :class="$style.topic">
      {{ props.topicContent === '' ? 'トピック未設定' : props.topicContent }}
    </span>
    <icon width="20" height="20" name="pencil" mdi />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  Ref,
  SetupContext
} from '@vue/composition-api'
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
      background: theme.background.primary,
      color: props.topicContent === '' ? theme.ui.secondary : theme.ui.primary,
      transform: props.isOpen ? 'translateY(0px)' : '',
      position: props.isOpen ? 'relative' : 'absolute'
    })),
    topic: makeStyles(theme => ({
      opacity: props.topicContent === '' ? '50%' : '100%'
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarTopicContent',
  components: { Icon },
  props: {
    topicContent: { type: String, default: 'トピック未設定' },
    isOpen: { type: Boolean, required: true }
  },
  setup(props: Props, context: SetupContext) {
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
  width: 256px;
  min-height: 48px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  z-index: -1;
  transition: transform 0.5s ease;
  overflow: hidden;
  will-change: transform;
  transform: translateY(-100%);
  user-select: none;
  contain: content;
  padding-right: 8px;
  padding-left: 8px;
  border-radius: 4px;
}

.topic {
  font-size: $topicSize;
  font-weight: bold;
  user-select: none;
  word-break: break-all;
  max-width: 220px;
}
</style>
