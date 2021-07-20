<template>
  <div>
    <h3 :class="$style.header">アクセスを許可しているアプリ</h3>
    <div :class="$style.content">
      <token-info
        v-for="token in tokensWithClientData"
        :key="token.id"
        :token="token"
        @revoke="revokeToken(token.id)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import apis from '/@/lib/apis'
import { ActiveOAuth2Token, OAuth2Client } from '@traptitech/traq'
import { OAuthClientId } from '/@/types/entity-ids'
import store from '/@/store'
import { getFullDayWithTimeString } from '/@/lib/date'
import { scopeNameMap } from '/@/lib/clientScope'
import useToastStore from '/@/providers/toastStore'
import TokenInfo from './TokenInfo.vue'

export default defineComponent({
  name: 'Tokens',
  components: {
    TokenInfo
  },
  setup() {
    const { addErrorToast } = useToastStore()
    store.dispatch.entities.fetchUsers()

    const tokens = ref<ActiveOAuth2Token[]>([])
    const clients = ref<Map<OAuthClientId, OAuth2Client>>(new Map())
    const tokensWithClientData = computed(() =>
      [...tokens.value]
        .sort((a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt))
        .map(token => {
          const client = clients.value.get(token.clientId)
          return {
            ...token,
            issuedAt: getFullDayWithTimeString(new Date(token.issuedAt)),
            scopes: token.scopes.map(scope => scopeNameMap[scope]),
            clientDesc: client?.description,
            clientName: client?.name,
            clientDeveloper: store.state.entities.usersMap.get(
              client?.developerId ?? ''
            )
          }
        })
    )

    const fetchTokens = async () => {
      const res = await apis.getMyTokens()
      tokens.value = res.data
    }
    const fetchClients = async () => {
      const res = await apis.getClients(true)
      clients.value = new Map(res.data.map(client => [client.id, client]))
    }
    const revokeToken = async (tokenId: string) => {
      if (!window.confirm('本当にトークンを無効化しますか？')) return
      try {
        await apis.revokeMyToken(tokenId)
        tokens.value = tokens.value.filter(token => token.id !== tokenId)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        addErrorToast('トークンの無効化に失敗しました')
      }
    }

    onMounted(() => {
      fetchTokens()
      fetchClients()
    })

    return { tokensWithClientData, revokeToken }
  }
})
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.content {
  @include color-ui-secondary;
  @include background-secondary;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  height: 400px;
  padding: 8px;
  margin-left: 12px;
  gap: 16px;
  border-radius: 8px;
  overflow-y: scroll;
}
</style>
