<template>
  <div :class="$style.container">
    <div :class="$style.input">
      <filter-input :on-secondary="true" :text="props.text" @input="onInput" />
    </div>
    <div :class="$style.star" :style="styles.star">
      <icon
        @click="context.emit('click')"
        name="star"
        :width="24"
        :height="24"
        :mdi="true"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import FilterInput from '@/components/UI/FilterInput.vue'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '@/lib/styles'
import useInput from '@/use/input'

const useStyles = (props: { isStared: Boolean }) =>
  reactive({
    star: makeStyles((theme, isStared) => ({
      color: props.isStared ? theme.accent.primary : theme.ui.secondary,
      backgroundColor: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'ChannelFilter',
  components: {
    Icon,
    FilterInput
  },
  props: {
    text: {
      type: String,
      required: true
    },
    isStared: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const styles = useStyles(props)
    const { onInput } = useInput(context)
    return {
      props,
      context,
      styles,
      onInput
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
}
.item {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: content-box;
}
.input {
  @extend .item;
  margin-right: 16px;
}
.star {
  @extend .item;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border: solid 1px transparent;
  border-radius: 4px;
  margin-right: 16px;
}
</style>
