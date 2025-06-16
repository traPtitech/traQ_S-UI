<template>
  <div :class="$style.container">
    <authenticate-header :class="$style.header" title="OAuth認可" />
    <client-description
      v-if="client"
      :class="[$style.item, $style.clientDesc]"
      :client="client"
      :developer="developer"
    />
    <p v-if="client" :class="$style.item">
      {{ client.name }}がtraQアカウントへのアクセスを要求しています
    </p>
    <client-scopes :scopes="scopes" />
    <div :class="$style.error">
      <span v-if="error">{{ error }}</span>
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
        :disabled="disableButton"
        @click="approve"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AuthenticateHeader from '../AuthenticateHeader.vue'
import ClientDescription from './ClientDescription.vue'
import ClientScopes from './ClientScopes.vue'
import AuthenticateButton from '../AuthenticateButton.vue'
import useConsent from './composables/useConsent'
import { useRoute } from 'vue-router'
import { getFirstQuery } from '/@/lib/basic/url'
import { computed } from 'vue'

const route = useRoute()
const paramScopes = computed(
  () => getFirstQuery(route.query['scopes'])?.split(' ') ?? undefined
)
const paramClientId = computed(
  () => getFirstQuery(route.query['client_id']) ?? undefined
)

const { client, scopes, developer, disableButton, error, approve, deny } =
  useConsent(paramClientId, paramScopes)
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
  color: $theme-accent-error-default;
}
</style>
