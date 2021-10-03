import { OAuth2Scope, OAuth2Client, User } from '@traptitech/traq'
import { OAuthClientId } from '/@/types/entity-ids'
import apis, { OAuthDecidePath } from '/@/lib/apis'
import { reactive } from 'vue'

const validScopes = new Set<string>(Object.values(OAuth2Scope))

interface ConsentParams {
  scopes: string[] | undefined
  clientId: OAuthClientId | undefined
}

interface State {
  client: OAuth2Client | undefined
  scopes: OAuth2Scope[]
  developer: User | undefined
  disableButton: boolean
  error: string | undefined
}

const isValidScope = (scope: string): scope is OAuth2Scope =>
  validScopes.has(scope)

const sendWithForm = (value: string) => {
  const $form = document.createElement('form')
  $form.method = 'post'
  $form.action = OAuthDecidePath
  $form.hidden = true

  // submitがname=submitにより衝突するのを回避
  $form['submitAlias'] = $form.submit

  const $input = document.createElement('input')
  $input.name = 'submit'
  $input.value = value
  $form.appendChild($input)

  document.body.appendChild($form)
  // $form.submit()の衝突回避
  $form['submitAlias']()
  $form.remove()
}

const useConsent = (params: ConsentParams) => {
  const state: State = reactive({
    client: undefined,
    scopes: params.scopes?.filter(isValidScope) ?? [],
    developer: undefined,
    disableButton: false,
    error: undefined
  })

  const fetchClient = async () => {
    state.disableButton = false
    if (!params.clientId) {
      state.error = 'ClientIdが存在しません'
      state.disableButton = true
      return
    }
    try {
      state.client = (await apis.getClient(params.clientId)).data
    } catch {
      state.error = 'Clientの取得に失敗しました'
      state.disableButton = true
      return
    }

    if (!params.scopes) {
      state.scopes = state.client.scopes
    }

    try {
      state.developer = (await apis.getUser(state.client.developerId)).data
    } catch {
      state.error = '開発者情報の取得に失敗しました'
      return
    }
  }

  const approve = () => {
    sendWithForm('approve')
  }

  const deny = () => {
    sendWithForm('deny')
  }

  fetchClient()

  return { state, approve, deny }
}

export default useConsent
