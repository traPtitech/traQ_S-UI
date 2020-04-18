<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.topic">
      <template v-if="propst.topicContent === ''">トピック未設定</template>
      <template v-else-if="!propst.topicContent">Now Loading</template>
      <template v-else>{{ propst.topicContent }}</template>
    </div>
    <icon :class="$style.icon" width="20" height="20" name="pencil" mdi />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (props: { topicContent?: string }) =>
  reactive({
    container: makeStyles(theme => ({
      color: props.topicContent === '' ? theme.ui.secondary : theme.ui.primary
    })),
    topic: makeStyles(theme => ({
      opacity: props.topicContent === '' ? '0.5' : '1'
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarTopicContent',
  components: { Icon },
  props: {
    topicContent: { type: String }
  },
  setup(props) {
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst = props as { topicContent?: string }
    const styles = useStyles(propst)
    return {
      styles,
      propst
    }
  }
})
</script>

<style lang="scss" module>
$topicSize: 1rem;

.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  user-select: none;
  width: 100%;
}

.topic {
  font-size: $topicSize;
  user-select: none;
  word-break: break-all;
}

.icon {
  flex-shrink: 0;
  margin-left: 16px;
}
</style>
