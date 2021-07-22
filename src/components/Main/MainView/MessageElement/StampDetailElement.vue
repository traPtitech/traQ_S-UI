<template>
  <div :class="$style.container">
    <div>
      {{ ':' + stampName + ': from' }}
    </div>
    <stamp-detail-element-content
      v-for="user in stamp.users"
      :key="user.id"
      :user-id="user.id"
      :count="user.count"
      :class="$style.content"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import store from '/@/store'
import StampDetailElementContent from './StampDetailElementContent.vue'
import { MessageStampById } from './MessageStampList.vue'

export default defineComponent({
  name: 'StampDetailListElement',
  components: {
    StampDetailElementContent
  },
  props: {
    stamp: {
      type: Object as PropType<MessageStampById>,
      required: true
    }
  },
  setup(props) {
    const stampName = computed(
      () => store.state.entities.stampsMap.get(props.stamp.id)?.name ?? ''
    )
    return { stampName }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-wrap: wrap;
}
.content {
  &::before {
    white-space: pre;
    content: ' ';
  }
}
</style>
