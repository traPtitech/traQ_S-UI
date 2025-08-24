// @ts-check
;(() => {
  /**
   * @type {import('/@/types/config').Config}
   */
  const config = {
    firebase: {
      apiKey: 'AIzaSyDee_VkrRtByJCrCZAX3nTSDPl8AaHlWfY',
      appId: '1:993645413001:web:b253ea3776d6cf85163c58',
      projectId: 'traq-r',
      messagingSenderId: '993645413001',
      vapidKey:
        'BPHegiDotHG7TlKhoW1qvwUYjOQj1C7RgKjvw3etUJZ_4x3LWUtFVXtRANWwckJX4G2w3CVj4zwi5QNThg7DZH4'
    },
    skyway: {
      apiKey: '55fd6e68-6e1b-492b-b57d-df0273c6e217'
    },
    enableSearch: true,
    services: [
      {
        label: 'Portal',
        iconPath: 'portal.svg',
        appLink: 'https://portal.trap.jp/'
      },
      {
        label: 'Official Website',
        iconPath: 'traP.svg',
        appLink: 'https://trap.jp/'
      },
      {
        label: 'Wiki',
        iconPath: 'crowi.svg',
        appLink: 'https://wiki.trap.jp/'
      },
      {
        label: 'Blog Admin',
        iconPath: 'ghost.svg',
        appLink: 'https://blog-admin.trap.jp/'
      },
      {
        label: 'Drive',
        iconPath: 'nextcloud.svg',
        appLink: 'https://drive.trap.jp/'
      },
      {
        label: 'Gitea',
        iconPath: 'gitea.svg',
        appLink: 'https://git.trap.jp/'
      },
      {
        label: 'NeoShowcase',
        iconPath: 'neoshowcase.svg',
        appLink: 'https://ns.trap.jp/'
      },
      {
        label: 'HackMD',
        iconPath: 'hackmd.svg',
        appLink: 'https://md.trap.jp/'
      },
      {
        label: 'anke-to',
        iconPath: 'anke-to.svg',
        appLink: 'https://anke-to.trap.jp/'
      },
      {
        label: 'booQ',
        iconPath: 'booq.svg',
        appLink: 'https://booq.trap.jp/'
      },
      {
        label: 'knoQ',
        iconPath: 'knoq.svg',
        appLink: 'https://knoq.trap.jp/'
      },
      {
        label: 'BOT Console',
        iconPath: 'bot-console.svg',
        appLink: 'https://bot-console.trap.jp/'
      },
      {
        label: 'Jomon',
        iconPath: 'jomon.svg',
        appLink: 'https://jomon.trap.jp/'
      },
      {
        label: 'traPortfolio',
        iconPath: 'traPortfolio.svg',
        appLink: 'https://portfolio.trap.jp/'
      },
      {
        label: 'tpf-admin',
        iconPath: 'traPortfolio-admin.svg',
        appLink: 'https://portfolio-admin.trap.jp/'
      }
    ],
    ogpIgnoreHostNames: [
      'wiki.trap.jp',
      'git.trap.jp',
      'md.trap.jp',
      'drive.trap.jp',
      'anke-to.trap.jp',
      'booq.trap.jp',
      'knoq.trap.jp',
      'wiki.trapti.tech',
      'git.trapti.tech',
      'md.trapti.tech',
      'drive.trapti.tech',
      'jomon.trap.jp',
      'ns.trap.jp',
      'portfolio-admin.trap.jp'
    ],
    wikiPageOrigin: 'https://wiki.trap.jp',
    blogPagePrefix: 'https://trap.jp/author/',
    auth: {
      resetLink: 'https://portal.trap.jp/reset-password',
      changeLink: 'https://portal.trap.jp/me/change-password',
      changeName: 'traPortal'
    },
    isRootChannelSelectableAsParentChannel: false,
    tooLargeFileMessage: '大きい%sの共有にはDriveを使用してください',
    showWidgetCopyButton: true,
    inlineReplyDisableChannels: [
      '#general',
      '#general/schedule',
      '#general/meeting',
      '#random',
      '#random/wasure',
      '#services'
    ],
    iosPwaInfoLink: 'https://wiki.trap.jp/SysAd/docs/traQ-S/PWA'
  }

  self.traQConfig = config
})()
