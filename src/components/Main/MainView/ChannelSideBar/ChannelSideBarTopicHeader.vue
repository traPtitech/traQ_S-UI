<template>
  <div :class="$style.container" :style="styles.container">
    <span :class="$style.topic">トピック</span>
    <icon
      width="20"
      height="20"
      :style="styles.icon"
      @click="click"
      name="rounded-triangle"
    />
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
  isOpen: boolean
}

const useStyles = (props: Props) =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    })),
    icon: makeStyles(theme => ({
      transform: props.isOpen ? 'rotate(180deg)' : '',
      transition: '0.5s'
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarTopicHeader',
  components: { Icon },
  props: {
    isOpen: { type: Boolean, required: true }
  },
  setup(props: Props, context: SetupContext) {
    const styles = useStyles(props)
    const click = () => {
      context.emit('switch')
    }
    return {
      styles,
      props,
      click
    }
  }
})
</script>

<style lang="scss" module>
$topicSize: 1.15rem;

.container {
  display: flex;
  height: 48px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  z-index: 1;
  padding-right: 8px;
  padding-left: 8px;
  border-radius: 4px;
}

.topic {
  font-size: $topicSize;
  font-weight: bold;
  user-select: none;
}

.icon {
  transform: rotate(180deg);
  transition: 0.7s;
}
</style>
