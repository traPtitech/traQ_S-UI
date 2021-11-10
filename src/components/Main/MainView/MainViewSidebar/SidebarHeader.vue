<template>
  <h2 :class="$style.title">
    <a-icon
      v-if="iconName"
      :class="$style.icon"
      :name="iconName"
      :mdi="iconMdi"
    />
    <span v-else-if="iconString" :class="$style.iconString">{{
      iconString
    }}</span>
    <span :class="$style.text">{{ text }}</span>
  </h2>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'SidebarHeader',
  components: {
    AIcon
  },
  props: {
    iconString: {
      type: String,
      default: undefined
    },
    iconName: {
      type: String,
      default: undefined
    },
    iconMdi: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      required: true
    }
  }
})
</script>

<style lang="scss" module>
.title {
  @include color-ui-primary;
  @include size-h2;
  display: flex;
  align-items: center;
  flex: 1;
  height: 100%;
  // 中身のtext-overflow: ellipsis用
  min-width: 0;
}

.icon {
  margin-right: 16px;
  flex-shrink: 0;
}

.iconString {
  margin-right: 0.125rem;
  user-select: none;
}

.text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
