<template>
  <div :class="$style.groups">
    <template v-if="isLoading">Now loading...</template>
    <template v-else>
      <ul>
        <li v-for="group in groups" :key="group.id">{{ group.name }}</li>
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
  name: 'GroupsTab',
  props: {
    detail: Object
  },
  setup(props: Props) {
    const isLoading = computed(() => props.detail === undefined)
    const groups = computed(
      () =>
        props.detail?.groups.map(
          groupId => store.state.entities.userGroups[groupId]
        ) ?? []
    )
    return { isLoading, groups }
  }
})
</script>

<style lang="scss" module>
.groups {
}
</style>
