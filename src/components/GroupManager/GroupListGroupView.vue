<template>
  <div :class="$style.container">
    <div :class="$style.name">{{ group.name }}</div>
    <div :class="$style.adminList">
      <a-icon name="crown" mdi />
      <user-icon-ellipsis-list
        direction="row"
        :user-ids="group.admins"
        prevent-modal
      />
    </div>
    <div :class="$style.editIconWrapper">
      <a-icon
        name="pencil-outline"
        mdi
        :class="$style.editIcon"
        @click="onClickEdit"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { UserGroup } from '@traptitech/traq'
import AIcon from '/@/components/UI/AIcon.vue'
import UserIconEllipsisList from '/@/components/UI/UserIconEllipsisList.vue'

export default defineComponent({
  name: 'GroupListGroupView',
  components: {
    AIcon,
    UserIconEllipsisList
  },
  props: {
    group: {
      type: Object as PropType<UserGroup>,
      required: true
    }
  },
  emits: {
    clickEdit: () => true
  },
  setup(props, { emit }) {
    const onClickEdit = () => {
      emit('clickEdit')
    }
    return { onClickEdit }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template:
    'name edit'
    'adminList edit' / 1fr min-content;
  align-items: center;
}
.name {
  @include color-ui-primary;
  grid-area: name;
  font-weight: bold;
}
.adminList {
  @include color-ui-secondary;
  grid-area: adminList;
  display: flex;
  align-items: center;
}
.editIconWrapper {
  @include color-ui-primary;
  grid-area: edit;
}
.editIcon {
  cursor: pointer;
}
</style>
