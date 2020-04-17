<template>
  <div :class="$style.container" :style="styles.container">
    <div @click="onClick" :class="$style.button">
      <icon mdi name="plus-circle-outline" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, SetupContext } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useClickHandlers = (context: SetupContext) => {
  const onClick = () => {
    context.emit('click')
  }
  return { onClick }
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'MessageInputUploadButton',
  components: {
    Icon
  },
  setup(_, context: SetupContext) {
    const styles = useStyles()
    const { onClick } = useClickHandlers(context)
    return {
      context,
      styles,
      onClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
}
.button {
  height: 24px;
  width: 24px;
  cursor: pointer;
}
</style>
