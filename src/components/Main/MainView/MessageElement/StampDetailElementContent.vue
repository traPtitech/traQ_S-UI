<template>
  <div :class="$style.container" @click="openModal">
    {{ user?.displayName ?? 'unknown' }}
    <span :class="$style.numberWrap">
      <spin-number :value="count" />
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import store from '/@/store'
import { UserId } from '/@/types/entity-ids'
import SpinNumber from '/@/components/UI/SpinNumber.vue'
import { useUserModalOpener } from '/@/use/modalOpener'

export default defineComponent({
  name: 'StampDetailElementContent',
  components: {
    SpinNumber
  },
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    count: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const user = computed(() => store.state.entities.usersMap.get(props.userId))

    const { openModal } = useUserModalOpener(props, user)

    return { user, openModal }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  cursor: pointer;
}
.numberWrap {
  display: flex;
  height: 1.5rem;
  overflow: hidden;
  &::before {
    content: '(';
    display: block;
  }
  &::after {
    content: ')';
    display: block;
  }
}
</style>
