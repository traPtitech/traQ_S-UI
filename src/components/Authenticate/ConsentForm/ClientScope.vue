<template>
  <li :class="$style.container" :data-is-open="$boolAttr(isOpen)">
    <div :class="$style.name" @click="toggleOpen">
      {{ scopeInfo.name }}
      <a-icon :class="$style.icon" name="rounded-triangle" />
    </div>
    <slide-down :is-open="isOpen">
      <ul :class="$style.permissions">
        <li v-for="permission in scopeInfo.permissions" :key="permission">
          {{ permission }}
        </li>
      </ul>
    </slide-down>
  </li>
</template>

<script lang="ts" setup>
import SlideDown from '/@/components/UI/SlideDown.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { computed } from 'vue'
import type { OAuth2Scope } from '@traptitech/traq'
import { scopeInfoMap } from '/@/lib/clientScope'
import useToggle from '/@/composables/utils/useToggle'

const props = defineProps<{
  scope: OAuth2Scope
}>()

const scopeInfo = computed(() => scopeInfoMap[props.scope])

const { value: isOpen, toggle: toggleOpen } = useToggle(false)
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
  padding: 12px;
  border-radius: 4px;
}
.name {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
  cursor: pointer;
  &:last-child {
    margin-bottom: 0;
  }
}
.icon {
  margin-left: auto;
  transform: rotate(0turn);
  .container[data-is-open] & {
    transform: rotate(0.5turn);
  }
  transition: 0.5s;
}
.permissions.permissions {
  padding-left: 24px;
  list-style: disc;
}
</style>
