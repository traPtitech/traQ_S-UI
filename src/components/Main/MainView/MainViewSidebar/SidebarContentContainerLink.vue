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
        <icon name="chevron-right" :class="$style.icon" mdi />
      </div>
    </template>
    <template #default></template>
  </sidebar-content-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SidebarContentContainer from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'SidebarContentContainerLink',
  components: {
    SidebarContentContainer,
    Icon
  },
  props: {
    title: String,
    count: Number,
    largePadding: {
      type: Boolean,
      default: false
    }
  },
  setup(_, context) {
    const onClickLink = () => context.emit('clickLink')
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
