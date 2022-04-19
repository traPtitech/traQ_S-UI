import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { isServerRequestUrl } from '/@/lib/apis'
import { sessionStorageRedirectKey } from '/@/lib/dom/storage'
import { settingsRoutes } from './settings'

export enum RouteName {
  Index = 'index',
  Channel = 'channel',
  User = 'user',
  Message = 'message',
  File = 'File',
  ClipFolders = 'clip-folders',
  ShareTarget = 'share-target',
  Login = 'login',
  Registration = 'registration',
  ResetPassword = 'reset-password',
  Consent = 'consent',
  GroupManager = 'group-manager',
  Settings = 'settings',
  NotFound = 'not-found'
}

export const constructChannelPath = (path: string) =>
  `/channels/${path}` as const
export const constructUserPath = (name: string) => `/users/${name}` as const
export const constructMessagesPath = (id: string) => `/messages/${id}` as const
export const constructFilesPath = (id: string) => `/files/${id}` as const
export const constructClipFoldersPath = (id: string) =>
  `/clip-folders/${id}` as const

export const isMessageScrollerRoute = (
  routeName: string | symbol | null | undefined
) => {
  if (typeof routeName !== 'string') return false
  return (
    routeName === RouteName.Channel ||
    routeName === RouteName.User ||
    routeName === RouteName.Message ||
    routeName === RouteName.ClipFolders
  )
}

const MainPage = () => import('/@/views/MainPage.vue')
const GroupManagerPage = () => import('/@/views/GroupManagerPage.vue')
const SettingsPage = () => import('/@/views/SettingsPage.vue')
const ShareTargetPage = () => import('/@/views/ShareTargetPage.vue')
const AuthPage = () => import('/@/views/AuthPage.vue')
const NotFoundPage = () => import('/@/views/NotFoundPage.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: RouteName.Index,
    component: MainPage
  },
  {
    path: constructChannelPath(':channel(.*)'),
    name: RouteName.Channel,
    component: MainPage
  },
  {
    path: constructUserPath(':user'),
    name: RouteName.User,
    component: MainPage
  },
  {
    path: constructMessagesPath(':id'),
    name: RouteName.Message,
    component: MainPage
  },
  {
    path: constructFilesPath(':id'),
    name: RouteName.File,
    component: MainPage
  },
  {
    path: constructClipFoldersPath(':id'),
    name: RouteName.ClipFolders,
    component: MainPage
  },
  {
    path: '/group-manager',
    name: RouteName.GroupManager,
    component: GroupManagerPage
  },
  {
    path: '/settings/:setting?',
    name: RouteName.Settings,
    component: SettingsPage,
    children: settingsRoutes
  },
  {
    path: '/share-target',
    name: RouteName.ShareTarget,
    component: ShareTargetPage
  },
  {
    path: '/login',
    name: RouteName.Login,
    component: AuthPage,
    props: { type: 'login' }
  },
  {
    path: '/registration',
    name: RouteName.Registration,
    component: AuthPage,
    props: { type: 'registration' }
  },
  {
    path: '/consent',
    name: RouteName.Consent,
    component: AuthPage,
    props: { type: 'consent' }
  },
  {
    path: '/:catchAll(.*)',
    name: RouteName.NotFound,
    component: NotFoundPage
  }
]

const routerHistory = createWebHistory(import.meta.env.BASE_URL)

const router = createRouter({
  history: routerHistory,
  routes
})
router.beforeEach((to, from) => {
  // trailing slashを消す
  if (to.path !== '/' && to.path.endsWith('/')) {
    return to.path.slice(0, -1)
  }
  return true
})

// 外部認証を利用してログインして戻ってきたときに、
// 見ようとしていたページにリダイレクトする
const removeSessionStorageRedirect = router.beforeResolve(() => {
  removeSessionStorageRedirect() // 一回確認すればよいため

  const redirectTo = sessionStorage.getItem(sessionStorageRedirectKey)
  if (redirectTo) {
    if (isServerRequestUrl(redirectTo)) {
      location.href = redirectTo
      return undefined
    }

    sessionStorage.removeItem(sessionStorageRedirectKey)
    return redirectTo
  }
  return undefined
})

export default router

/**
 * チャンネルパスが変化したときに/channels/～を書き換える
 * @param nowPath 書き換えたいパス
 * @param paths 元のパスとその新しいパス
 * @returns nullのときは書き換え不要、文字列のときはnowPathを書き換えた結果
 */
export const rewriteChannelPath = (
  nowPath: string,
  { oldPath, newPath }: { oldPath: string; newPath: string }
) => {
  const oldFullPath = constructChannelPath(oldPath)

  if (!nowPath.startsWith(oldFullPath)) {
    return null
  }
  const newFullPath = constructChannelPath(newPath)
  return `${newFullPath}${nowPath.slice(oldFullPath.length)}`
}
