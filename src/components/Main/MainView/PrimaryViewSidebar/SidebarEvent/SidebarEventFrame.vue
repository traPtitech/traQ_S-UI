<template>
  <OptionalRouterLink
    :class="$style.container"
    :data-is-link-available="$boolAttr(!!link)"
    :to="link"
    block
  >
    <div :class="$style.titleWrapper">
      <AIcon :name="iconName" :mdi="iconMdi" />
      <div :class="$style.title">
        {{ title }}
      </div>
    </div>
    <div :class="$style.header">
      <UserIcon :user-id="userId" :size="20" />
      <div :class="$style.time">
        {{ timeString }}
      </div>
    </div>
    <div :class="$style.separator" />
    <div :class="$style.content">
      <slot />
    </div>
  </OptionalRouterLink>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import AIcon from '/@/components/UI/AIcon.vue'
import OptionalRouterLink from '/@/components/UI/OptionalRouterLink.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { getFullDayWithTimeString } from '/@/lib/basic/date'
import type { UserId } from '/@/types/entity-ids'

const props = withDefaults(
  defineProps<{
    title: string
    iconName: string
    iconMdi?: boolean
    userId: UserId
    datetime: string
    link?: string
  }>(),
  {
    iconMdi: false
  }
)

const timeString = computed(() =>
  getFullDayWithTimeString(new Date(props.datetime))
)
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  padding: 8px 20px;
  border-radius: 4px;
  &[data-is-link-available] {
    cursor: pointer;
  }
}

.titleWrapper {
  @include color-ui-primary;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-weight: bold;
}
.title {
  flex: 1;
  margin-left: 4px;
}

.header {
  display: flex;
  align-items: center;
}
.time {
  @include color-ui-secondary;
  @include size-caption;
  margin-left: 4px;
}

.separator {
  @include background-secondary;
  width: 100%;
  height: 2px;
  margin: 4px 0;
}

.content {
  @include color-ui-primary;
  word-break: break-all;
}
</style>
