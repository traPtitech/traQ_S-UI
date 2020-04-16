<template>
  <div>
    <span
      :style="[propst.isCurrent ? styles.current : '']"
      :class="$style.channelHash"
      >#</span
    >
    <span :style="[propst.isCurrent ? styles.current : '']">
      <router-link :to="propst.isCurrent ? '' : propst.link">{{
        propst.name
      }}</router-link>
    </span>
    <div v-if="propst.topic" :class="$style.topic">
      {{ propst.topic }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    current: makeStyles(theme => ({
      color: theme.accent.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarRelationElement',
  props: {
    name: { type: String, required: true },
    topic: { type: String, default: '' },
    isCurrent: { type: Boolean, default: false },
    link: { type: String }
  },
  setup(props) {
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst =
      props as { name: string; topic: string; isCurrent: boolean; link: string }
    const styles = useStyles()
    return { propst, styles }
  }
})
</script>

<style lang="scss" module>
$topiclSize: 1rem;

.channelHash {
  margin-right: 0.125rem;
  user-select: none;
}

.topic {
  font-weight: normal;
  font-size: $topiclSize;
}
</style>
