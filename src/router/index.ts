import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
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

export const constructChannelPath = (channel: string) => `/channels/${channel}`
export const constructUserPath = (name: string) => `/users/${name}`
export const constructClipFoldersPath = (id: string) => `/clip-folders/${id}`

export const changeRouteByPath = (path: string) => {
  // 同じ場所に移動しようとした際のエラーを消す
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  router.push(path).catch(() => {})
}

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

const Main = () => import('/@/views/Main.vue')
const GroupManager = () => import('/@/views/GroupManager.vue')
const Settings = () => import('/@/views/Settings.vue')
const ShareTarget = () => import('/@/views/ShareTarget.vue')
const Auth = () => import('/@/views/Auth.vue')
const NotFound = () => import('/@/views/NotFound.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: RouteName.Index,
    component: Main
  },
  {
    path: constructChannelPath(':channel(.*)'),
    name: RouteName.Channel,
    component: Main
  },
  {
    path: '/users/:user',
    name: RouteName.User,
    component: Main
  },
  {
    path: '/messages/:id',
    name: RouteName.Message,
    component: Main
  },
  {
    path: '/files/:id',
    name: RouteName.File,
    component: Main
  },
  {
    path: '/clip-folders/:id',
    name: RouteName.ClipFolders,
    component: Main
  },
  {
    path: '/group-manager',
    name: RouteName.GroupManager,
    component: GroupManager
  },
  {
    path: '/settings/:setting?',
    name: RouteName.Settings,
    component: Settings,
    children: settingsRoutes
  },
  {
    path: '/share-target',
    name: RouteName.ShareTarget,
    component: ShareTarget
  },
  {
    path: '/login',
    name: RouteName.Login,
    component: Auth,
    props: { type: 'login' }
  },
  {
    path: '/registration',
    name: RouteName.Registration,
    component: Auth,
    props: { type: 'registration' }
  },
  {
    path: '/consent',
    name: RouteName.Consent,
    component: Auth,
    props: { type: 'consent' }
  },
  {
    path: '/:catchAll(.*)',
    name: RouteName.NotFound,
    component: NotFound
  }
]

const routerHistory = createWebHistory(import.meta.env.BASE_URL)

const router = createRouter({
  history: routerHistory,
  routes
})
router.beforeEach((to, from, next) => {
  // trailing slashを消す
  if (to.path !== '/' && to.path.endsWith('/')) {
    next(to.path.slice(0, -1))
    return
  }

  next()
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
