<template>
  <div v-if="props.parent">
    <span :class="$style.channelHash">#</span>
    <span>{{ props.parent }}</span>
    <div :class="$style.channel">
      <div :class="$style.current">
        <span :class="$style.channelHash">#</span>
        <span>{{ props.current }}</span>
      </div>
      <div :class="$style.channel">
        <div v-for="child in props.children" :key="child">
          <span :class="$style.channelHash">#</span>
          <span>{{ child }}</span>
        </div>
      </div>
      <div v-for="sister in props.sisters" :key="sister">
        <span :class="$style.channelHash">#</span>
        <span>{{ sister }}</span>
      </div>
    </div>
  </div>
  <div v-else>
    <span :class="$style.channelHash">#</span>
    <span>{{ props.current }}</span>
    <div :class="$style.channel">
      <div v-for="child in props.children" :key="child">
        <span :class="$style.channelHash">#</span>
        <span>{{ child }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import ChannelSideBarHeaderName from './ChannelSideBarHeaderName.vue'
import { makeStyles } from '@/lib/styles'

type Props = {
  parent: string | null
  children: (string | undefined)[]
  sisters: (string | undefined)[]
  current: string | null
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarRelationContent',
  props: {
    parent: { type: String, reqired: true },
    children: { type: Array, reqired: true },
    sisters: { type: Array, reqired: true },
    current: { type: String, reqired: true }
  },
  components: { ChannelSideBarHeaderName },
  setup(props: Props) {
    const styles = useStyles()
    return { props, styles }
  }
})
</script>

<style lang="scss" module>
$channelSize: 1.15rem;

.channel {
  font-size: $channelSize;
  margin-left: 4px;
  padding-left: 12px;
  border-left: solid;
  font-weight: bold;
}

.channelHash {
  margin-right: 0.125rem;
  user-select: none;
}

.current {
  
}
</style>
