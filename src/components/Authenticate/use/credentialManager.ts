import { buildUserIconPathPublic } from '/@/lib/apis'
import { checkCredentialManagerSupport } from '/@/lib/basic/browser'

const isCredentialManagerSupported = checkCredentialManagerSupport()

const useCredentialManager = () => {
  const getPass = async () => {
    if (!isCredentialManagerSupported) return

    try {
      const res = await navigator.credentials.get({
        password: true,
        mediation: 'optional'
      })
      if (!res) {
        return res
      }
      if (res.type === 'password') {
        return res
      }
    } catch {
      // 制限とかで使えない場合
    }
    return null
  }

  const savePass = async (name: string, pass: string) => {
    if (!isCredentialManagerSupported) return

    try {
      const passCred = new PasswordCredential({
        id: name,
        password: pass,
        name: `By password - ${name}`,
        iconURL: buildUserIconPathPublic(name)
      })
      await navigator.credentials.store(passCred)
    } catch {
      // 制限とかで使えない場合
    }
  }

  return { getPass, savePass }
}

export default useCredentialManager
