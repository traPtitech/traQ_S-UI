<template>
  <group-list-group-edit v-if="isSelected" :group="group" />
  <group-list-group-view v-else :group="group" @clickEdit="onSelect" />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { UserGroup } from '@traptitech/traq'
import GroupListGroupEdit from './GroupListGroupEdit.vue'
import GroupListGroupView from './GroupListGroupView.vue'

export default defineComponent({
  name: 'GroupListGroup',
  components: {
    GroupListGroupEdit,
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
  },
  setup(props, { emit }) {
    const onSelect = () => {
      emit('select', props.group.id)
    }
    return { onSelect }
  }
})
</script>
