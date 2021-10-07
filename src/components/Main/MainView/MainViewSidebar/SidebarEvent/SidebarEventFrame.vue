<template>
  <optional-router-link
    :class="$style.container"
    :data-is-link-available="$boolAttr(!!link)"
    :to="link"
    block
  >
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
  </optional-router-link>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import Icon from '/@/components/UI/Icon.vue'
import { UserId } from '/@/types/entity-ids'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { getFullDayWithTimeString } from '/@/lib/date'
import OptionalRouterLink from '/@/components/UI/OptionalRouterLink.vue'

export default defineComponent({
  name: 'SidebarEventFrame',
  components: {
    OptionalRouterLink,
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
    },
    link: {
      type: String,
      default: undefined
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
