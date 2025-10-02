<template>
  <div :class="$style.pageJumpButtons">
    <PageJumpButton
      @click="((currentSection -= 1), (currentPage = SECTION_SIZE - 1))"
    >
      <AIcon name="chevron-double-left" mdi />
    </PageJumpButton>

    <PageJumpButton @click="currentPage -= 1">
      <AIcon name="chevron-left" mdi />
    </PageJumpButton>

    <PageJumpButton
      v-for="(page, index) in generateNavigatorLabels(
        currentPage,
        Math.max(pageCount, currentPage + 1)
      )"
      :key="`${currentPage}-${index}`"
      :aria-selected="page === currentPage"
      @click="page !== null ? (currentPage = page) : null"
    >
      {{ page !== null ? SECTION_SIZE * currentSection + page : '...' }}
    </PageJumpButton>

    <PageJumpButton @click="currentPage += 1">
      <AIcon name="chevron-right" mdi />
    </PageJumpButton>

    <PageJumpButton @click="((currentSection += 1), (currentPage = 0))">
      <AIcon name="chevron-double-right" mdi />
    </PageJumpButton>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import PageJumpButton from './PageJumpButton.vue'
import { generateNavigatorLabels } from '/@/lib/pagination'

const SECTION_SIZE = 500

const currentPage = defineModel<number>('page', { default: 0 })
const currentSection = defineModel<number>('section', { default: 0 })

const { pageCount } = defineProps<{
  pageCount: number
}>()
</script>

<style lang="scss" module>
.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
}
.navigationButton {
  @include color-ui-secondary;
  display: grid;
  grid-auto-flow: column;
  column-gap: 0.5rem;
  padding: 0.5rem;
  &[data-direction='next'] {
    padding-left: 1rem;
  }
  &[data-direction='previous'] {
    padding-right: 1rem;
  }
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  &[aria-hidden='true'] {
    visibility: hidden;
  }
  &:hover {
    @include background-secondary;
  }
}
.pageJumpButtons {
  @include color-ui-secondary;
  display: flex;
  gap: 0.25rem;
  margin: 0.5rem auto;
}
</style>
