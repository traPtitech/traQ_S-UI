<template>
  <navigation-content-container subtitle="ユーザーグループ">
    <router-link to="/group-manager">
      <button :class="$style.button">
        <a-icon name="group" :class="$style.icon" />
        グループ管理
      </button>
    </router-link>
  </navigation-content-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'GroupManagerOpener',
  components: {
    NavigationContentContainer,
    AIcon
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.button {
  @include color-ui-secondary;
  @include background-primary;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
.icon {
  margin-right: 4px;
}
</style>
