<template>
  <section>
    <profile-header text="アカウント" />
    <p v-if="showWikiPageLink" :class="$style.p">
      <circle-icon
        name="book"
        mdi
        :color="iconColor"
        :background="iconBackgroundColor"
        :class="$style.icon"
      />
      <a
        :href="wikiPageLink"
        rel="noopener noreferrer"
        target="_blank"
        @click.stop=""
      >
        {{ wikiPageName }}
      </a>
    </p>
    <p v-if="twitterId !== ''" :class="$style.p">
      <circle-icon
        name="twitter"
        mdi
        :color="iconColor"
        :background="iconBackgroundColor"
        :class="$style.icon"
      />
      <template v-if="twitterId === undefined">Now Loading...</template>
      <template v-else>
        <a
          :href="twitterLink"
          rel="noopener noreferrer"
          target="_blank"
          @click.stop=""
        >
          @{{ twitterId }}
        </a>
      </template>
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import store from '/@/store'
import ProfileHeader from './ProfileHeader.vue'
import CircleIcon from '/@/components/UI/CircleIcon.vue'

export default defineComponent({
  name: 'AccountList',
  components: {
    ProfileHeader,
    CircleIcon
  },
  props: {
    bot: {
      type: Boolean,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    twitterId: {
      type: String,
      default: undefined
    }
  },
  setup(props) {
    const iconBackgroundColor = computed(
      () =>
        store.getters.app.themeSettings.currentTheme.basic.ui.primary.default
    )
    const iconColor = computed(
      () =>
        store.getters.app.themeSettings.currentTheme.basic.background.primary
          .border
    )

    const { wikiPageOrigin } = window.traQConfig
    const showWikiPageLink = wikiPageOrigin !== undefined
    const wikiPageName = computed(() => {
      if (props.bot) {
        return `bot/${props.name.replace(/^BOT_/, '')}`
      }
      return `user/${props.name}`
    })
    const wikiPageLink = computed(
      () => `${wikiPageOrigin}/${wikiPageName.value}`
    )
    const twitterLink = computed(
      () => `https://twitter.com/${props.twitterId ?? ''}`
    )
    return {
      iconColor,
      iconBackgroundColor,
      showWikiPageLink,
      wikiPageName,
      wikiPageLink,
      twitterLink
    }
  }
})
</script>

<style lang="scss" module>
.p {
  margin: 8px 0;
}
.icon {
  margin-right: 4px;
  vertical-align: bottom;
}
</style>
