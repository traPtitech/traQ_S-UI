<template>
  <header :class="$style.container">
    <div :class="$style.headerContainer">
      <button :class="$style.navigationButton" v-if="isMobile" @click="openNav">
        <icon name="traQ" />
      </button>
      <h2 :class="$style.headerBody">
        <slot name="header" />
      </h2>
    </div>
    <slot :class="$style.tools" name="tools" />
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '@/components/UI/Icon.vue'
import useIsMobile from '@/use/isMobile'
import useNavigationController from '@/use/navigationController'

export default defineComponent({
  name: 'MainViewHeader',
  components: {
    Icon
  },
  setup() {
    const { isMobile } = useIsMobile()
    const { openNav } = useNavigationController()
    return {
      isMobile,
      openNav
    }
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
}
.headerBody {
  width: 100%;
  min-width: 0;
}
.headerContainer {
  display: flex;
  min-width: 0;
}
.navigationButton {
  @include color-ui-primary;
  display: flex;
  align-items: center;
  margin-right: 8px;
}
.tools {
  flex-shrink: 0;
}
</style>
