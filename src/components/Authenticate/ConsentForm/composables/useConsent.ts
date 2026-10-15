import type { OAuth2Client, User } from '@traptitech/traq'

import type { Ref } from 'vue'
import { computed, ref } from 'vue'

import apis, { OAuthDecidePath } from '/@/lib/apis'
import type { OAuthClientId } from '/@/types/entity-ids'

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

const useConsent = (
  clientId: Ref<OAuthClientId | undefined>,
  paramScopes: Ref<string[] | undefined>
) => {
  const client = ref<OAuth2Client>()
  // 未知のスコープも除外せずに表示する
  const scopes = computed<string[]>(
    () =>
      paramScopes.value?.filter(scope => scope !== '') ??
      client.value?.scopes ??
      []
  )
  const developer = ref<User>()
  const disableButton = ref(false)
  const error = ref<string>()

  const fetchClient = async () => {
    disableButton.value = false
    if (!clientId.value) {
      error.value = 'ClientIdが存在しません'
      disableButton.value = true
      return
    }
    try {
      client.value = (await apis.getClient(clientId.value)).data
    } catch {
      error.value = 'Clientの取得に失敗しました'
      disableButton.value = true
      return
    }

    try {
      developer.value = (await apis.getUser(client.value.developerId)).data
    } catch {
      error.value = '開発者情報の取得に失敗しました'
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

  return { client, scopes, developer, disableButton, error, approve, deny }
}

export default useConsent
