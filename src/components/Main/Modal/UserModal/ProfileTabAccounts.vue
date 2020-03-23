<template>
  <section>
    <h2>アカウント</h2>
    <p>
      <circle-icon
        name="book"
        :mdi="true"
        :color="iconColor"
        :background="iconBackgroundColor"
      />
      <a :href="wikiPageLink" target="_blank" @click.stop="">
        {{ wikiPageName }}
      </a>
    </p>
    <p v-if="props.twitterId !== ''">
      <circle-icon
        name="twitter"
        :mdi="true"
        :color="iconColor"
        :background="iconBackgroundColor"
      />
      <template v-if="props.twitterId === undefined">Now Loading...</template>
      <template v-else>
        <a :href="twitterLink" target="_blank" @click.stop="">
          @{{ props.twitterId }}
        </a>
      </template>
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import CircleIcon from '@/components/UI/CircleIcon.vue'

interface Props {
  bot: boolean
  name: string
  twitterId?: string
}

export default defineComponent({
  name: 'ProfileTabAccounts',
  props: {
    bot: {
      type: Boolean,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    twitterId: String
  },
  setup(props: Props) {
    const iconBackgroundColor = computed(() => store.state.app.theme.ui.primary)
    const iconColor = computed(() => store.state.app.theme.background.primary)

    const wikiPageName = computed(() => {
      if (props.bot) {
        return `bot/${props.name.replace(/^BOT_/, '')}`
      }
      return `user/${props.name}`
    })
    const wikiPageLink = computed(
      () => `https://wiki.trap.jp/${wikiPageName.value}`
    )
    const twitterLink = computed(
      () => `https://twitter.com/${props.twitterId ?? ''}`
    )
    return {
      props,
      iconColor,
      iconBackgroundColor,
      wikiPageName,
      wikiPageLink,
      twitterLink
    }
  },
  components: {
    CircleIcon
  }
})
</script>

<style lang="scss" module>
.homeChannel {
}
</style>
