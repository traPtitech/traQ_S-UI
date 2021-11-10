<template>
  <sidebar-content-container
    clickable
    :title="title"
    :large-padding="largePadding"
    @toggle="onClickLink"
  >
    <template #header-control>
      <div>
        <span v-if="count !== undefined" :class="$style.count">{{
          count
        }}</span>
        <a-icon name="chevron-right" :class="$style.icon" mdi />
      </div>
    </template>
    <template #default></template>
  </sidebar-content-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SidebarContentContainer from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'SidebarContentContainerLink',
  components: {
    SidebarContentContainer,
    AIcon
  },
  props: {
    title: {
      type: String,
      default: undefined
    },
    count: {
      type: Number,
      default: undefined
    },
    largePadding: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    clickLink: () => true
  },
  setup(_, { emit }) {
    const onClickLink = () => {
      emit('clickLink')
    }
    return { onClickLink }
  }
})
</script>

<style lang="scss" module>
.count {
  font-weight: normal;
}
.icon {
  margin-left: 4px;
  vertical-align: bottom;
}
</style>
