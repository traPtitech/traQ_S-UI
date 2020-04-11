<template>
  <div>
    <div v-if="propst.parent" :class="$style.channel">
      <channel-side-bar-relation-element
        :name="propst.parent.name"
        :topic="propst.parent.topic"
        :link="buildParentLink()"
      />
    </div>
    <div
      v-if="propst.current"
      :class="$style.channel"
      :style="[propst.parent ? styles.firstBoarder : '']"
    >
      <channel-side-bar-relation-element
        :isCurrent="true"
        :name="propst.current.name"
        :topic="propst.current.topic"
      />
      <div
        :class="$style.channel"
        :style="[propst.parent ? styles.secondBoarder : styles.firstBoarder]"
      >
        <div v-for="(child, index) in propst.children" :key="child.id">
          <channel-side-bar-relation-element
            v-if="index < 3 || state.isOpenChildren"
            :name="child.name"
            :topic="child.topic"
            :link="buildChildLink(child.name)"
          />

          <div
            v-else-if="index === 3"
            :class="$style.text"
            @click="toggleChildren"
          >
            子チャンネルを全て表示(+{{ propst.children.length - 3 }})
          </div>
        </div>
      </div>
      <div v-for="(sibling, index) in propst.siblings" :key="sibling.id">
        <channel-side-bar-relation-element
          v-if="index < 3 || state.isOpensiblings"
          :name="sibling.name"
          :topic="sibling.topic"
          :link="buildSiblingLink(sibling.name)"
        />
        <div
          v-else-if="index === 3"
          :class="$style.text"
          @click="togglesiblings"
        >
          兄弟チャンネルを全て表示(+{{ propst.siblings.length - 3 }})
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import ChannelSideBarRelationElement from './ChannelSideBarRelationElement.vue'
import { makeStyles } from '@/lib/styles'
import { ChannelState } from './ChannelSideBarRelation.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    })),
    current: makeStyles(theme => ({
      color: theme.accent.primary
    })),
    firstBoarder: makeStyles(theme => ({
      borderLeft: `solid ${theme.background.tertiary}`
    })),
    secondBoarder: makeStyles(theme => ({
      borderLeft: `solid ${theme.background.secondary}`
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarRelationContent',
  props: {
    parent: {
      type: Object as PropType<ChannelState | undefined>
    },
    children: { type: Array as PropType<ChannelState[]>, required: true },
    siblings: { type: Array as PropType<ChannelState[]>, required: true },
    current: {
      type: Object as PropType<ChannelState | undefined>,
      required: true
    }
  },
  components: { ChannelSideBarRelationElement },
  setup(props) {
    // TODO: https://github.com/vuejs/composition-api/issues/291ops
    const propst =
      props as
      {
        parent: ChannelState | undefined
        children: ChannelState[]
        siblings: ChannelState[]
        current: ChannelState | undefined
      }
    const styles = useStyles()
    const state = reactive({
      isOpensiblings: false,
      isOpenChildren: false
    })
    const toggleChildren = () => {
      state.isOpenChildren = !state.isOpenChildren
    }
    const togglesiblings = () => {
      state.isOpensiblings = !state.isOpensiblings
    }
    const buildChildLink = (channel: string | undefined) =>
      `${location.pathname}/${channel ?? ''}`
    const buildParentLink = () =>
      `${location.pathname.split('/').slice(0, -1).join('/')}`
    const buildSiblingLink = (channel: string | undefined) =>
      `${location.pathname.split('/').slice(0, -1).join('/')}/${channel ?? ''}`
    return {
      propst,
      styles,
      state,
      toggleChildren,
      togglesiblings,
      buildChildLink,
      buildParentLink,
      buildSiblingLink
    }
  }
})
</script>

<style lang="scss" module>
$channelSize: 1.15rem;
$textSize: 0.95rem;

.channel {
  font-size: $channelSize;
  margin-left: 4px;
  padding-left: 12px;
  font-weight: bold;
  word-break: break-all;
  &:first-child {
    margin-left: 0px;
    padding-left: 0px;
  }
}

.text {
  font-size: $textSize;
  cursor: pointer;
}
</style>
