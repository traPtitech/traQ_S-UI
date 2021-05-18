<template>
  <group-list-group-view v-if="!isSelected" :group="group" />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { UserGroup } from '@traptitech/traq'
import GroupListGroupView from './GroupListGroupView.vue'

export default defineComponent({
  name: 'GroupListGroup',
  components: {
    GroupListGroupView
  },
  props: {
    group: {
      type: Object as PropType<UserGroup>,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  }
})
</script>
