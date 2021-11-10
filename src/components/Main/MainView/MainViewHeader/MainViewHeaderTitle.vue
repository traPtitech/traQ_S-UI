<template>
  <div :class="$style.container">
    <a-icon
      v-if="iconName"
      :class="$style.icon"
      :name="iconName"
      :mdi="iconMdi"
    />
    <h1 :class="$style.title">{{ title }}</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'MainViewHeaderTitle',
  components: { AIcon },
  props: {
    iconMdi: {
      type: Boolean,
      defualt: false
    },
    iconName: { type: String, default: undefined },
    title: { type: String, required: true }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 8px;
  flex-shrink: 0;
}

.title {
  @include size-h1;
}
</style>
