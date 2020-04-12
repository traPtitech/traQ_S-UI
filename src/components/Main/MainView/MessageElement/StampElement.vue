<template>
  <div
    :class="$style.body"
    :style="styles.body"
    @click="onClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div :class="$style.stampContainer">
      <img loading="lazy" :src="state.src" :alt="state.stamp.name" />
    </div>
    <spin-number
      :value="state.count"
      :class="$style.count"
      :style="styles.count"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  SetupContext,
  watch
} from '@vue/composition-api'
import { StampId } from '@/types/entity-ids'
import store from '@/store'
import { BASE_PATH, Stamp, MessageStamp, buildFilePath } from '@/lib/api'
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'
import useHover from '@/use/hover'
import SpinNumber from '@/components/UI/SpinNumber.vue'

type Props = {
  stampId: StampId
  stamps: MessageStamp[]
}

export default defineComponent({
  name: 'StampElement',
  components: { SpinNumber },
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
      src: computed(() => buildFilePath(stamp.value.fileId)),
      includeMe: computed(() =>
        props.stamps.some(
          stamp => stamp.userId === store.state.domain.me.detail?.id
        )
      ),
      isProgress: false
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
      if (state.isProgress) return
      if (state.includeMe) {
        context.emit('remove-stamp', props.stampId)
      } else {
        context.emit('add-stamp', props.stampId)
      }
      state.isProgress = true
    }
    watch(
      () => props.stamps,
      () => {
        state.isProgress = false
      }
    )

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
  user-select: none;
  overflow: hidden;
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
  font-weight: bold;
  margin: {
    left: 6px;
    right: 4px;
  }
}
</style>
