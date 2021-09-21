<template>
  <div :class="$style.container">
    <share-target-component :title="title" :text="text" :url="url" />
    <stamp-picker-container />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { getStringParam } from '/@/lib/util/params'
import ShareTargetComponent from '/@/components/ShareTarget/ShareTarget.vue'
import StampPickerContainer from '/@/components/Main/StampPicker/StampPickerContainer.vue'
import { useRoute } from 'vue-router'
import useLoginCheck from './use/loginCheck'

export default defineComponent({
  name: 'Share',
  components: {
    ShareTargetComponent,
    StampPickerContainer
  },
  setup(props, context) {
    const route = useRoute()
    const query = computed(() => route.query)
    const title = computed(() => getStringParam(query.value.title))
    const text = computed(() => getStringParam(query.value.text))
    const url = computed(() => getStringParam(query.value.url))

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
