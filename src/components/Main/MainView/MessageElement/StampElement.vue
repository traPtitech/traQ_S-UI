<template>
  <div
    :class="$style.body"
    :style="styles.body"
    @click="onClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div :class="$style.stampContainer">
      <img :src="state.src" :alt="state.stamp.name" />
    </div>
    <div :class="$style.count" :style="styles.count">
      {{ state.count }}
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  SetupContext
} from '@vue/composition-api'
import { StampId } from '@/types/entity-ids'
import store from '@/store'
import { BASE_PATH, Stamp, MessageStamp } from '@/lib/api'
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'
import useHover from '@/use/hover'

type Props = {
  stampId: StampId
  stamps: MessageStamp[]
}

export default defineComponent({
  name: 'StampElement',
  props: {
    stampId: {
      type: String,
      required: true
    },
    stamps: {
      type: Array,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const stamp = computed(() => store.state.entities.stamps[props.stampId])
    const { hoverState, onMouseEnter, onMouseLeave } = useHover(context)
    const state = reactive({
      count: computed(() =>
        props.stamps.reduce((acc, cur) => {
          return acc + cur.count
        }, 0)
      ),
      stamp,
      src: computed(() => `${BASE_PATH}/files/${stamp.value.fileId}`),
      includeMe: computed(() =>
        props.stamps.some(stamp => stamp.userId === store.state.domain.me.id)
      )
    })
    const styles = reactive({
      body: makeStyles(theme => {
        return {
          backgroundColor: state.includeMe
            ? transparentize(theme.accent.primary, 0.3)
            : theme.background.tertiary
        }
      }),
      count: makeStyles(theme => {
        return {
          color: state.includeMe
            ? theme.ui.primary
            : hoverState.hover
            ? theme.ui.primary
            : transparentize(theme.ui.primary, 0.6)
        }
      })
    })

    const onClick = () => {
      if (state.includeMe) {
        context.emit('remove-stamp', props.stampId)
      } else {
        context.emit('add-stamp', props.stampId)
      }
    }

    return {
      props,
      state,
      styles,
      onClick,
      hoverState,
      onMouseEnter,
      onMouseLeave
    }
  }
})
</script>

<style lang="scss" module>
.body {
  display: inline-flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
}

.stampContainer {
  width: 20px;
  height: 20px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center center;
  }
}

.count {
  font-size: 0.8rem;
  min-width: 1.1rem;
  font-weight: bold;
  padding: {
    left: 6px;
    right: 4px;
  }
  user-select: none;
}
</style>
