<template>
  <div :class="$style.container" :style="styles.container">
    <div @click="onClick" :class="$style.circle" :style="styles.circle">
      <icon name="close" mdi />
    </div>
    <span :class="$style.text" v-if="props.withText">閉じる</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (props: { size: number; isWhite: boolean }) =>
  reactive({
    container: makeStyles((theme, common) => ({
      color: props.isWhite ? common.text.black : theme.ui.secondary
    })),
    circle: makeStyles((theme, common) => ({
      borderColor: props.isWhite ? 'transparent' : theme.ui.tertiary,
      width: `${props.size}px`,
      height: `${props.size}px`,
      backgroundColor: props.isWhite ? common.text.whitePrimary : 'transparent'
    }))
  })

export default defineComponent({
  name: 'CloseButton',
  props: {
    withText: { type: Boolean, default: false },
    size: { type: Number, required: true },
    isWhite: { type: Boolean, default: false }
  },
  setup(props, context) {
    const styles = useStyles(props)

    const onClick = () => {
      context.emit('click')
    }
    return { styles, onClick, props }
  },
  components: {
    Icon
  }
})
</script>

<style lang="scss" module>
.container {
  text-align: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.circle {
  display: flex;
  height: 52px;
  width: 52px;
  justify-content: center;
  align-items: center;
  border: solid 3px;
  border-radius: 50%;
  cursor: pointer;
}

.text {
  margin-top: 8px;
}
</style>
