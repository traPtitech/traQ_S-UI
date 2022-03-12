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
import StampDetailElementContent from './StampDetailElementContent.vue'
import { MessageStampById } from './MessageStampList.vue'
import { useStampsStore } from '/@/store/entities/stamps'

export default defineComponent({
  name: 'StampDetailElement',
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
    const { stampsMap } = useStampsStore()

    const stampName = computed(
      () => stampsMap.value.get(props.stamp.id)?.name ?? ''
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
