<template>
  <div
    :class="$style.body"
    :title="state.tooltip"
    :data-include-me="state.includeMe"
    @click="onClick"
  >
    <div :class="$style.stampContainer">
      <img loading="lazy" :src="state.src" draggable="false" />
    </div>
    <spin-number :value="state.count" :class="$style.count" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  watch,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import { buildFilePath } from '@/lib/apis'
import SpinNumber from '@/components/UI/SpinNumber.vue'
import { MessageStamp } from '@traptitech/traq'
import { StampId } from '@/types/entity-ids'

export default defineComponent({
  name: 'StampElement',
  components: { SpinNumber },
  props: {
    stampId: {
      type: String as PropType<StampId>,
      required: true
    },
    stamps: {
      type: Array as PropType<MessageStamp[]>,
      required: true
    }
  },
  setup(props, context) {
    const stamp = computed(() => store.state.entities.stamps[props.stampId])

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
      tooltip: computed(() =>
        [
          `:${stamp.value.name}:`,
          ...props.stamps.map(
            s =>
              `${store.state.entities.users[s.userId]?.displayName ?? ''}(${
                s.count
              })`
          )
        ].join(' ')
      ),
      isProgress: false
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
      onClick
    }
  }
})
</script>

<style lang="scss" module>
.body {
  @include background-tertiary;
  &[data-include-me] {
    background: $theme-accent-primary--03;
  }
  display: inline-flex;
  flex-shrink: 0;
  height: 24px;
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
  color: $theme-ui-primary--06;
  .body[data-include-me] &,
  .body:hover & {
    @include color-ui-primary;
  }
  @include size-body2;
  font-weight: bold;
  margin: {
    left: 6px;
    right: 4px;
  }
}
</style>
