<template>
  <header :class="$style.container">
    <div :class="$style.headerContainer">
      <popup-navigator
        v-if="isMobile"
        :class="$style.icon"
        @clickIcon="openNav"
      />
      <h2 :class="$style.headerBody">
        <slot name="header" />
      </h2>
    </div>
    <slot :class="$style.tools" name="tools" />
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useNavigationController from '/@/use/navigationController'
import PopupNavigator from '/@/components/Main/PopupNavigatior/PopupNavigator.vue'
import useIsMobile from '/@/use/isMobile'

export default defineComponent({
  name: 'MainViewHeader',
  components: {
    PopupNavigator
  },
  setup() {
    const { isMobile } = useIsMobile()
    const { openNav } = useNavigationController()
    return { isMobile, openNav }
  }
})
</script>

<style lang="scss" module>
$headerHeight: 80px;

.container {
  @include background-primary;
  @include color-ui-primary;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $headerHeight;
  width: 100%;
  flex: 0 0 $headerHeight;
  padding: 16px;
  border-bottom: 2px solid $theme-ui-tertiary;
  contain: layout;
}
.icon {
  @include color-ui-primary;
  height: 36px;
  width: 36px;
  margin-right: 8px;
}
.headerBody {
  width: 100%;
  min-width: 0;
  user-select: none;
}
.headerContainer {
  display: flex;
  min-width: 0;
}
.tools {
  flex-shrink: 0;
}
</style>
