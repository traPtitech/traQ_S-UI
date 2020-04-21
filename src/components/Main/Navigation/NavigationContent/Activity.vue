<template>
  <div :class="$style.container">
    <activity-element
      v-for="message in state.messages"
      :key="message.id"
      :class="$style.element"
      :message="message"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  reactive,
  computed
} from '@vue/composition-api'
import store from '@/store'
import ActivityElement from './ActivityElement.vue'

export default defineComponent({
  name: 'Activity',
  components: {
    ActivityElement
  },
  setup(_, context: SetupContext) {
    const state = reactive({
      messages: computed(() => store.state.domain.channelActivity)
    })
    return { state }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 0 16px 0 0;
}
.element {
  margin: 16px 0;
}
</style>
