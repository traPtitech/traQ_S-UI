<template>
  <div :class="$style.container" :data-is-small="small">
    <div :class="$style.valueContainer" @click="toggle">
      {{ currentItem?.title ?? '' }}
      <a-icon
        :class="$style.trailingIcon"
        name="rounded-triangle"
        :size="small ? 20 : 24"
      />
    </div>
    <click-outside @click-outside="close">
      <div v-if="isOpen" :class="$style.selectorContainer">
        <div
          v-for="item in items"
          :key="item.value"
          :class="$style.itemContainer"
          @click="onClick(item)"
        >
          <div :class="$style.item">
            <a-icon
              v-if="item.iconName"
              :name="item.iconName"
              :mdi="item.iconMdi"
              :class="$style.itemIcon"
            />
            {{ item.title }}
          </div>
        </div>
      </div>
    </click-outside>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import AIcon from './AIcon.vue'
import ClickOutside from './ClickOutside'
import useToggle from '/@/composables/utils/useToggle'

const modelValue = defineModel<string>({ default: '' })

export type PopupSelectorItem = {
  value: string
  title: string
  iconName?: string
  iconMdi?: boolean
}

const props = withDefaults(
  defineProps<{
    items: PopupSelectorItem[]
    small?: boolean
  }>(),
  {
    small: false
  }
)

const { value: isOpen, toggle, close } = useToggle()

const onClick = (item: PopupSelectorItem) => {
  modelValue.value = item.value
  close()
}
const currentItem = computed(() =>
  props.items.find(item => item.value === modelValue.value)
)
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
