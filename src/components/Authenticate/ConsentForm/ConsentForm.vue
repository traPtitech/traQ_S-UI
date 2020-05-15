<template>
  <div :class="$style.container">
    <authenticate-header :class="$style.header" title="OAuth認可" />
    <client-description
      v-if="state.client"
      :class="[$style.item, $style.clientDesc]"
      :client="state.client"
      :developer="state.developer"
    />
    <p v-if="state.client" :class="$style.item">
      {{ state.client.name }}がtraQアカウントへのアクセスを要求しています
    </p>
    <client-scopes :scopes="state.scopes" />
    <div :class="$style.error">
      <span v-if="state.error">{{ state.error }}</span>
    </div>
    <div :class="$style.buttons">
      <authenticate-button-secondary label="キャンセル" @click="deny" />
      <authenticate-button-primary
        label="許可"
        :disabled="state.disableButton"
        @click="approve"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useConsent from './use/consent'
import AuthenticateHeader from '../AuthenticateHeader.vue'
import ClientDescription from './ClientDescription.vue'
import ClientScopes from './ClientScopes.vue'
import AuthenticateButtonPrimary from '../AuthenticateButtonPrimary.vue'
import AuthenticateButtonSecondary from '../AuthenticateButtonSecondary.vue'

export default defineComponent({
  name: 'ConsentForm',
  components: {
    AuthenticateHeader,
    ClientDescription,
    ClientScopes,
    AuthenticateButtonPrimary,
    AuthenticateButtonSecondary
  },
  setup(_, context) {
    const {
      scopes: rawScopes,
      client_id: rawClientId
    } = context.root.$route.query

    const { state, approve, deny } = useConsent({
      scopes: !Array.isArray(rawScopes) ? rawScopes?.split(' ') : undefined,
      clientId: !Array.isArray(rawClientId) ? rawClientId : undefined
    })

    return { state, approve, deny }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
}
.item {
  margin: 24px 0;
  display: block;
}
.header {
  margin-bottom: 48px;
}

.clientDesc {
  margin: 24px auto;
}

.buttons {
  display: flex;
  flex-wrap: wrap-reverse;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 48px;
}
.error {
  font-weight: bold;
  color: $theme-accent-error;
}
</style>
