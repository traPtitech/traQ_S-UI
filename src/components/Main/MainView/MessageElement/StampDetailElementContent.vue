<template>
  <div :class="$style.container">
    {{ user.name + '(' }}
    <spin-number :value="props.count" />
    {{ ')' }}
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import store from '@/store'
import { UserId } from '@/types/entity-ids'
import SpinNumber from '@/components/UI/SpinNumber.vue'

export default defineComponent({
  name: 'StampDetailListElementContent',
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
    const user = computed(() => store.state.entities.users[props.userId])
    return { user, props }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
}
</style>
