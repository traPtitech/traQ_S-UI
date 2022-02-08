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
            v-if="!state.isOpenChildren && childrenRemainCount > 0"
            :class="$style.text"
            @click="toggleChildren"
          >
            <div>子チャンネルを全て表示</div>
            <div>(+{{ childrenRemainCount }})</div>
          </div>
        </div>
      </template>
      <div
        v-if="!state.isOpenSiblings && siblingsRemainCount > 0"
        :class="$style.text"
        @click="toggleSiblings"
      >
        <div>兄弟チャンネルを全て表示</div>
        <div>(+{{ siblingsRemainCount }})</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType, computed } from 'vue'
import ChannelSidebarRelationElement from './ChannelSidebarRelationElement.vue'
import { Channel } from '@traptitech/traq'
import { pickSomeAroundIndex } from '/@/lib/basic/array'

const SIBLINGS_DEFAULT_COUNT = 5
const SIBLINGS_DEFAULT_HALF = (SIBLINGS_DEFAULT_COUNT - 1) / 2
const CHILDREN_DEFAULT_COUNT = 3

const buildChildLink = (channel: string) => `${location.pathname}/${channel}`
const buildParentLink = () =>
  `${location.pathname.split('/').slice(0, -1).join('/')}`
const buildSiblingLink = (channel: string) =>
  `${location.pathname.split('/').slice(0, -1).join('/')}/${channel}`

export default defineComponent({
  name: 'ChannelSidebarRelationContent',
  components: { ChannelSidebarRelationElement },
  props: {
    parent: {
      type: Object as PropType<Channel>,
      default: undefined
    },
    children: {
      type: Array as PropType<Channel[]>,
      default: () => []
    },
    siblings: {
      type: Array as PropType<Channel[]>,
      default: () => []
    },
    current: {
      type: Object as PropType<Channel>,
      default: undefined
    }
  },
  setup(props) {
    const state = reactive({
      isOpenSiblings: false,
      isOpenChildren: false
    })
    const toggleChildren = () => {
      state.isOpenChildren = !state.isOpenChildren
    }
    const toggleSiblings = () => {
      state.isOpenSiblings = !state.isOpenSiblings
    }

    const filteredChildren = computed(() =>
      state.isOpenChildren
        ? props.children
        : props.children.slice(0, CHILDREN_DEFAULT_COUNT)
    )
    const filteredSiblings = computed(() => {
      if (state.isOpenSiblings) return props.siblings
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

    return {
      state,
      toggleChildren,
      toggleSiblings,
      filteredChildren,
      filteredSiblings,
      childrenRemainCount,
      siblingsRemainCount,
      buildChildLink,
      buildParentLink,
      buildSiblingLink
    }
  }
})
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
