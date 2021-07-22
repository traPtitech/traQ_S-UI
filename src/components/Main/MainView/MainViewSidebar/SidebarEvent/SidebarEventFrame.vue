<template>
  <div :class="$style.container">
    <div :class="$style.titleWrapper">
      <icon :name="iconName" :mdi="iconMdi" />
      <div :class="$style.title">{{ title }}</div>
    </div>
    <div :class="$style.header">
      <user-icon :user-id="userId" :size="20" />
      <div :class="$style.time">{{ timeString }}</div>
    </div>
    <div :class="$style.separator" />
    <div :class="$style.content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import Icon from '/@/components/UI/Icon.vue'
import { UserId } from '/@/types/entity-ids'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { getFullDayWithTimeString } from '/@/lib/date'

export default defineComponent({
  name: 'SidebarEventFrame',
  components: {
    Icon,
    UserIcon
  },
  props: {
    title: {
      type: String,
      required: true
    },
    iconName: {
      type: String,
      required: true
    },
    iconMdi: {
      type: Boolean,
      default: false
    },
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    datetime: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const timeString = computed(() =>
      getFullDayWithTimeString(new Date(props.datetime))
    )
    return { timeString }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  padding: 8px 20px;
  border-radius: 4px;
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
