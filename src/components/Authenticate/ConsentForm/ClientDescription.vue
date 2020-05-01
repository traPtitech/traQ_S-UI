<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.name">{{ client.name }}</div>
    <div :class="$style.desc">
      <div :class="$style.descTitle" :style="styles.descTitle">
        開発者
      </div>
      <div :class="$style.descContent">
        <template v-if="propst.developer">
          <user-icon
            :class="$style.developerIcon"
            :user-id="propst.developer.id"
            :fallback-icon-file-id="propst.developer.iconFileId"
            :size="24"
          />
          {{ propst.developer.displayName }} (@{{ propst.developer.name }})
        </template>
        <template v-else>
          <div>=====</div>
        </template>
      </div>
      <div :class="$style.descTitle" :style="styles.descTitle">
        説明
      </div>
      <div :class="$style.descContent">
        {{ client.description }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { OAuth2Client, User } from '@traptitech/traq'
import UserIcon from '@/components/UI/UserIcon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.primary
    })),
    descTitle: makeStyles(theme => ({
      color: theme.ui.secondary,
      borderColor: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ConsentFormClientDesc',
  props: {
    client: {
      type: Object as PropType<OAuth2Client>,
      required: true
    },
    developer: Object as PropType<User>
  },
  setup(props) {
    const propst = props as { developer?: User }

    const styles = useStyles()

    return { styles, propst }
  },
  components: {
    UserIcon
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  padding: 12px;
  border-radius: 12px;
}
.name {
  margin-bottom: 12px;
  font-weight: bold;
  text-align: center;
}
.desc {
  display: grid;
  grid-template-columns: min-content fit-content(100%);
  grid-template-rows: 1fr 1fr;
  grid-column-gap: 12px;
  grid-row-gap: 8px;
}
.descTitle {
  word-break: keep-all;
  padding: 4px 12px;
  margin: auto 0;
  border: solid 2px;
  border-radius: 18px;
  font-weight: bold;
  text-align: center;
}
.descContent {
  word-break: keep-all;
  overflow-wrap: anywhere;
  margin: auto 0;
}
.developerIcon {
  display: inline-block;
  margin-right: 4px;
  vertical-align: bottom;
}
</style>
