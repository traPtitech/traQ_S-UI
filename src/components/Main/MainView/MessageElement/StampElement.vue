<template>
  <div
    :class="$style.body"
    :title="state.tooltip"
    :data-include-me="state.includeMe"
    @click="onClick"
  >
    <stamp :stamp-id="stamp.id" :size="20" without-title />
    <spin-number :value="stamp.sum" :class="$style.count" />
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
import SpinNumber from '@/components/UI/SpinNumber.vue'
import Stamp from '@/components/UI/Stamp.vue'
import { MessageStampById } from './MessageStampList.vue'

export default defineComponent({
  name: 'StampElement',
  components: { Stamp, SpinNumber },
  props: {
    stamp: {
      type: Object as PropType<MessageStampById>,
      required: true
    }
  },
  setup(props, context) {
    const stampName = computed(
      () => store.state.entities.stamps[props.stamp.id]?.name
    )

    const state = reactive({
      includeMe: computed(() =>
        props.stamp.users.some(
          user => user.id === store.state.domain.me.detail?.id
        )
      ),
      tooltip: computed(() =>
        [
          `:${stampName.value}:`,
          ...props.stamp.users.map(
            u =>
              `${store.state.entities.users[u.id]?.displayName ?? ''}(${
                u.count
              })`
          )
        ].join(' ')
      ),
      isProgress: false
    })

    const onClick = () => {
      if (state.isProgress) return
      if (state.includeMe) {
        context.emit('remove-stamp', props.stamp.id)
      } else {
        context.emit('add-stamp', props.stamp.id)
      }
      state.isProgress = true
    }
    watch(
      () => props.stamp,
      () => {
        state.isProgress = false
      }
    )

    return {
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
  contain: content;
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
