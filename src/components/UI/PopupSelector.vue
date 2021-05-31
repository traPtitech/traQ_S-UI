<template>
  <div :class="$style.container" :data-is-small="small">
    <div :class="$style.valueContainer" @click="toggle">
      {{ currentItem?.title ?? '' }}
      <icon
        :class="$style.trailingIcon"
        name="rounded-triangle"
        :width="small ? 20 : 24"
      />
    </div>
    <div
      v-if="isOpen"
      v-click-outside="close"
      :class="$style.selectorContainer"
    >
      <div
        v-for="item in items"
        :key="item.value"
        :class="$style.itemContainer"
        @click="onClick(item)"
      >
        <div :class="$style.item">
          <icon
            v-if="item.iconName"
            :name="item.iconName"
            :mdi="item.iconMdi"
            :class="$style.itemIcon"
          />
          {{ item.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue'
import Icon from './Icon.vue'

export type PopupSelectorItem = {
  value: string
  title: string
  iconName?: string
  iconMdi?: boolean
}

export default defineComponent({
  name: 'PopupSelector',
  components: { Icon },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    items: {
      type: Array as PropType<PopupSelectorItem[]>,
      required: true
    },
    small: {
      type: Boolean,
      default: false
    }
  },
  setup(props, ctx) {
    const isOpen = ref(false)
    const toggle = () => (isOpen.value = !isOpen.value)
    const close = () => (isOpen.value = false)
    const onClick = (item: PopupSelectorItem) => {
      ctx.emit('update:modelValue', item.value)
      close()
    }
    const currentItem = computed(() =>
      props.items.find(item => item.value === props.modelValue)
    )
    return { onClick, currentItem, isOpen, toggle, close }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  position: relative;
  width: max-content;
  &[data-is-small='true'] {
    @include size-body2;
  }
}
.valueContainer {
  font: {
    weight: bold;
  }
  cursor: pointer;
  display: flex;
  align-items: center;
}
.trailingIcon {
  margin-left: 1rem;
}
.selectorContainer {
  @include drop-shadow-default;
  @include background-primary;
  @include size-body1;
  position: absolute;
  left: 0;
  top: 100%;
  z-index: $z-index-header-tools;
  width: max-content;
  border-radius: 4px;
  cursor: pointer;
}
.itemIcon {
  margin-right: 0.5rem;
}
.itemContainer {
  cursor: pointer;
  &:hover {
    @include background-secondary;
  }
  &:first-child {
    margin-top: 0.25rem;
  }
  &:last-child {
    margin-bottom: 0.25rem;
  }
}
.item {
  @include color-ui-secondary;
  padding: 0.25rem 0.75rem;
}
</style>
