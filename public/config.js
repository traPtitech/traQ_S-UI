// @ts-check
;(() => {
  /**
   * @type {import('config').Config}
   */
  const config = {
    enableQall: true,
    enableSearch: true,
    services: [
      {
        label: 'Official Website',
        iconPath: 'traP.svg',
        appLink: 'https://trap.jp/'
      }
    ],
    isRootChannelSelectableAsParentChannel: false
  }

  self.traQConfig = config
})()
