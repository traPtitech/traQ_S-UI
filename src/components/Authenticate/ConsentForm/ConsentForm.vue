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
      <authenticate-button
        type="secondary"
        :class="$style.button"
        label="キャンセル"
        @click="deny"
      />
      <authenticate-button
        type="primary"
        :class="$style.button"
        label="許可"
        :disabled="state.disableButton"
        @click="approve"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useConsent from './use/consent'
import AuthenticateHeader from '../AuthenticateHeader.vue'
import ClientDescription from './ClientDescription.vue'
import ClientScopes from './ClientScopes.vue'
import AuthenticateButton from '../AuthenticateButton.vue'
import { useRoute } from 'vue-router'
import { getFirstQuery } from '/@/lib/basic/url'

export default defineComponent({
  name: 'ConsentForm',
  components: {
    AuthenticateHeader,
    ClientDescription,
    ClientScopes,
    AuthenticateButton
  },
  setup() {
    const route = useRoute()
    const { scopes: rawScopes, client_id: rawClientId } = route.query

    const { state, approve, deny } = useConsent({
      scopes: getFirstQuery(rawScopes)?.split(' ') ?? undefined,
      clientId: getFirstQuery(rawClientId) ?? undefined
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
.button {
  width: calc(50% - 16px);
  margin: 0 16px;
  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    margin-right: 0;
  }
}
.error {
  font-weight: bold;
  color: $theme-accent-error;
}
</style>
