<template>
  <div>
    <div v-if="parent" :class="$style.channel" data-is-parent>
      <channel-sidebar-relation-element
        :name="parent.name"
        :topic="parent.topic"
        :link="buildParentLink()"
        :class="$style.element"
      />
    </div>
    <div v-if="current" :class="$style.channel">
      <template v-for="sibling in filteredSiblings" :key="sibling.id">
        <channel-sidebar-relation-element
          :name="sibling.name"
          :topic="sibling.topic"
          :link="buildSiblingLink(sibling.name)"
          :class="$style.element"
          :is-current="sibling.id === current.id"
        />
        <div
          v-if="sibling.id === current.id"
          :class="$style.channel"
          data-is-children
        >
          <channel-sidebar-relation-element
            v-for="child in filteredChildren"
            :key="child.id"
            :name="child.name"
            :topic="child.topic"
            :link="buildChildLink(child.name)"
            :class="$style.element"
          />
          <div
            v-if="!isChildrenOpen && childrenRemainCount > 0"
            :class="$style.text"
            @click="toggleChildren"
          >
            <div>子チャンネルを全て表示</div>
            <div>(+{{ childrenRemainCount }})</div>
          </div>
        </div>
      </template>
      <div
        v-if="!isSiblingsOpen && siblingsRemainCount > 0"
        :class="$style.text"
        @click="toggleSiblings"
      >
        <div>兄弟チャンネルを全て表示</div>
        <div>(+{{ siblingsRemainCount }})</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Channel } from '@traptitech/traq'
import { pickSomeAroundIndex } from '/@/lib/basic/array'
import ChannelSidebarRelationElement from './ChannelSidebarRelationElement.vue'
import useToggle from '/@/composables/utils/useToggle'

const props = withDefaults(
  defineProps<{
    parent?: Channel
    children?: Channel[]
    siblings?: Channel[]
    current?: Channel
  }>(),
  {
    children: () => [],
    siblings: () => []
  }
)

const SIBLINGS_DEFAULT_COUNT = 5
const SIBLINGS_DEFAULT_HALF = (SIBLINGS_DEFAULT_COUNT - 1) / 2
const CHILDREN_DEFAULT_COUNT = 3

const { value: isSiblingsOpen, toggle: toggleSiblings } = useToggle(false)
const { value: isChildrenOpen, toggle: toggleChildren } = useToggle(false)

const filteredChildren = computed(() =>
  isChildrenOpen.value
    ? props.children
    : props.children.slice(0, CHILDREN_DEFAULT_COUNT)
)
const filteredSiblings = computed(() => {
  if (isSiblingsOpen.value) return props.siblings
  const currentId = props.current?.id
  if (!currentId) return props.siblings.slice(0, SIBLINGS_DEFAULT_COUNT)

  const index = props.siblings.findIndex(s => s.id === currentId)
  return pickSomeAroundIndex(props.siblings, index, SIBLINGS_DEFAULT_HALF)
})

const childrenRemainCount = computed(
  () => props.children.length - CHILDREN_DEFAULT_COUNT
)
const siblingsRemainCount = computed(
  () => props.siblings.length - SIBLINGS_DEFAULT_COUNT
)

const buildChildLink = (channel: string) => `${location.pathname}/${channel}`
const buildParentLink = () =>
  `${location.pathname.split('/').slice(0, -1).join('/')}`
const buildSiblingLink = (channel: string) =>
  `${location.pathname.split('/').slice(0, -1).join('/')}/${channel}`
</script>

<style lang="scss" module>
.channel {
  margin-left: 4px;
  padding-left: 12px;
  font-weight: bold;
  word-break: break-all;
  border-left: solid $theme-background-tertiary-border;
  &[data-is-children] {
    border-left: solid $theme-background-secondary-border;
  }
  &[data-is-parent]:first-child {
    margin-left: 0px;
    padding-left: 0px;
  }
  &[data-is-parent] {
    border: none;
  }
}

.element {
  // FIXME: 例外的に6px、あとでデザイン修正
  margin: 6px 0;
}

.text {
  @include color-ui-secondary;
  @include background-secondary;
  @include size-body2;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
}
</style>
