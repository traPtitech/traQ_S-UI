<template>
  <div :class="$style.container">
    <share-target-component :title="title" :text="text" :url="url" />
    <stamp-picker-container />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { getFirstQuery } from '/@/lib/basic/url'
import ShareTargetComponent from '/@/components/ShareTarget/ShareTarget.vue'
import StampPickerContainer from '/@/components/Main/StampPicker/StampPickerContainer.vue'
import { useRoute } from 'vue-router'
import useLoginCheck from './composables/useLoginCheck'

export default defineComponent({
  name: 'ShareTargetPage',
  components: {
    ShareTargetComponent,
    StampPickerContainer
  },
  setup() {
    const route = useRoute()
    const query = computed(() => route.query)
    const title = computed(
      () => getFirstQuery(query.value['title']) ?? undefined
    )
    const text = computed(() => getFirstQuery(query.value['text']) ?? undefined)
    const url = computed(() => getFirstQuery(query.value['url']) ?? undefined)

    useLoginCheck()

    return { title, text, url }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: auto;
  scrollbar-gutter: stable;
  padding: 48px 16px;
}
</style>
