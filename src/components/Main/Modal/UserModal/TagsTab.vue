<template>
  <div :class="$style.tags">
    <template v-if="isLoading">Now loading...</template>
    <template v-else>
      <ul>
        <li v-for="tag in tags" :key="tag.tagId">{{ tag.tag }}</li>
      </ul>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import { UserDetail } from '@traptitech/traq'

interface Props {
  detail?: UserDetail
}

export default defineComponent({
  name: 'TagsTab',
  props: {
    detail: Object
  },
  setup(props: Props) {
    const isLoading = computed(() => props.detail === undefined)
    const tags = computed(() => props.detail?.tags ?? [])
    return { isLoading, tags }
  }
})
</script>

<style lang="scss" module>
.tags {
}
</style>
