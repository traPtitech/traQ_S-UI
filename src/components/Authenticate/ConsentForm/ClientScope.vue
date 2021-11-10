<template>
  <li :class="$style.container" :data-is-open="$boolAttr(isOpen)">
    <div :class="$style.name" @click="toggleOpen">
      {{ name }}
      <a-icon :class="$style.icon" name="rounded-triangle" />
    </div>
    <slide-down :is-open="isOpen">
      <ul :class="$style.permissions">
        <li v-for="permission in permissions" :key="permission">
          {{ permission }}
        </li>
      </ul>
    </slide-down>
  </li>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue'
import { OAuth2Scope } from '@traptitech/traq'
import SlideDown from '/@/components/UI/SlideDown.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { scopeNameMap, scopePermissionsMap } from '/@/lib/clientScope'

export default defineComponent({
  name: 'ClientScope',
  components: {
    SlideDown,
    AIcon
  },
  props: {
    scope: {
      type: String as PropType<OAuth2Scope>,
      required: true
    }
  },
  setup(props) {
    const name = computed(() => scopeNameMap[props.scope])
    const permissions = computed(() => scopePermissionsMap[props.scope])

    const isOpen = ref(false)
    const toggleOpen = () => {
      isOpen.value = !isOpen.value
    }

    return { name, permissions, isOpen, toggleOpen }
  }
})
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
