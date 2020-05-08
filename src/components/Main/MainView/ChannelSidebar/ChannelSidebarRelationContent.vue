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
      <channel-sidebar-relation-element
        is-current
        :name="current.name"
        :topic="current.topic"
        :class="$style.element"
      />
      <div :class="$style.channel" data-is-children>
        <channel-sidebar-relation-element
          v-for="child in filteredChildren"
          :key="child.id"
          :name="child.name"
          :topic="child.topic"
          :link="buildChildLink(child.name)"
          :class="$style.element"
        />
        <div
          v-if="!state.isOpenChildren && children.length > 3"
          :class="$style.text"
          @click="toggleChildren"
        >
          <div>子チャンネルを全て表示</div>
          <div>(+{{ children.length - 3 }})</div>
        </div>
      </div>
      <channel-sidebar-relation-element
        v-for="sibling in filteredSiblings"
        :key="sibling.id"
        :name="sibling.name"
        :topic="sibling.topic"
        :link="buildSiblingLink(sibling.name)"
        :class="$style.element"
      />
      <div
        v-if="!state.isOpenSiblings && siblings.length > 3"
        :class="$style.text"
        @click="toggleSiblings"
      >
        <div>兄弟チャンネルを全て表示</div>
        <div>(+{{ siblings.length - 3 }})</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  PropType,
  computed
} from '@vue/composition-api'
import ChannelSidebarRelationElement from './ChannelSidebarRelationElement.vue'
import { Channel } from '@traptitech/traq'

export default defineComponent({
  name: 'ChannelSidebarRelationContent',
  props: {
    parent: Object as PropType<Channel>,
    children: {
      type: Array as PropType<Channel[]>,
      default: []
    },
    siblings: {
      type: Array as PropType<Channel[]>,
      default: []
    },
    current: Object as PropType<Channel>
  },
  components: { ChannelSidebarRelationElement },
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
      state.isOpenChildren ? props.children : props.children.slice(0, 3)
    )
    const filteredSiblings = computed(() =>
      state.isOpenSiblings ? props.siblings : props.siblings.slice(0, 3)
    )

    const buildChildLink = (channel: string) =>
      `${location.pathname}/${channel}`
    const buildParentLink = () =>
      `${location.pathname.split('/').slice(0, -1).join('/')}`
    const buildSiblingLink = (channel: string) =>
      `${location.pathname.split('/').slice(0, -1).join('/')}/${channel}`

    return {
      state,
      toggleChildren,
      toggleSiblings,
      filteredChildren,
      filteredSiblings,
      buildChildLink,
      buildParentLink,
      buildSiblingLink
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
}
.current {
  @include color-accent-primary;
}

.channel {
  margin-left: 4px;
  padding-left: 12px;
  font-weight: bold;
  word-break: break-all;
  border-left: solid $theme-background-tertiary;
  &[data-is-children] {
    border-left: solid $theme-background-secondary;
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
  &[data-has-parent] {
    margin-left: 8px;
  }
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
