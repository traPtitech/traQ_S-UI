<template>
  <div :class="$style.container" @click="onClick">
    <span :class="$style.query">{{ insertQuery }}</span>
    <span :class="$style.description">{{ description }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SearchSuggestionQueryItem',
  props: {
    insertQuery: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  emits: {
    select: (_insertQuery: string) => true
  },
  setup(props, { emit }) {
    const onClick = () => {
      emit('select', props.insertQuery)
    }
    return { onClick }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  display: grid;
  grid-template-columns: 5rem 1fr;
  user-select: none;
  cursor: pointer;
  &:hover {
    @include background-secondary;
  }
}
.query {
  @include size-body1;
  @include color-ui-primary;
}
.description {
  @include size-body2;
  @include color-ui-secondary;
}
</style>
