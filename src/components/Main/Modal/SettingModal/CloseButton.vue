<template>
  <div :class="$style.container" :style="styles.container">
    <div @click="onClick" :class="$style.circle" :style="styles.circle">
      <icon name="close" mdi />
    </div>
    <span :class="$style.text" v-if="propst.withText">閉じる</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (props: { size: number }) =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.secondary
    })),
    circle: makeStyles(theme => ({
      borderColor: theme.ui.tertiary,
      width: `${props.size}px`,
      height: `${props.size}px`
    }))
  })

export default defineComponent({
  name: 'CloseButton',
  props: {
    withText: { type: Boolean, default: false },
    size: { type: Number, required: true }
  },
  setup(props, context) {
    const propst = props as { withText: boolean; size: number }
    const styles = useStyles(propst)

    const onClick = () => {
      context.emit('click')
    }
    return { styles, onClick, propst }
  },
  components: {
    Icon
  }
})
</script>

<style lang="scss" module>
.container {
  position: absolute;
  top: 30px;
  right: 120px;
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
