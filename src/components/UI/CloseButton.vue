<template>
  <button
    :class="$style.container"
    :style="styles.container"
    :data-react-hover="reactHover"
  >
    <div @click="onClick" :class="$style.circle" :style="styles.circle">
      <icon name="close" mdi />
    </div>
    <span :class="$style.text" v-if="props.withText">閉じる</span>
  </button>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (props: {
  borderWidth: number
  size: number
  isWhite: boolean
}) =>
  reactive({
    container: makeStyles((theme, common) => ({
      color: props.isWhite ? common.text.black : theme.ui.secondary
    })),
    circle: makeStyles((theme, common) => ({
      borderWidth: `${props.borderWidth}px`,
      borderColor: props.isWhite ? 'transparent' : theme.ui.secondary,
      width: `${props.size}px`,
      height: `${props.size}px`,
      backgroundColor: props.isWhite ? common.text.whitePrimary : 'transparent'
    }))
  })

export default defineComponent({
  name: 'CloseButton',
  props: {
    withText: { type: Boolean, default: false },
    borderWidth: { type: Number, default: 2 },
    size: { type: Number, required: true },
    isWhite: { type: Boolean, default: false },
    reactHover: { type: Boolean, default: true }
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
  opacity: 0.5;
  &:hover,
  &:not([data-react-hover]) {
    opacity: 1;
  }
}

.circle {
  display: flex;
  justify-content: center;
  align-items: center;
  border: solid;
  border-radius: 50%;
  cursor: pointer;
}

.text {
  display: block;
  margin-top: 8px;
}
</style>
