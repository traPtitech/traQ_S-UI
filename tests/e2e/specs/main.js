describe('Main', () => {
  beforeEach(() => {
    cy.login()

    cy.disableSW()
  })

  afterEach(() => {
    cy.logout()
  })

  it('can show channel', () => {
    cy.visit('/channels/general')

    cy.get('.markdown-body')
  })

  it('can show user modal', () => {
    cy.visit('/channels/general')

    cy.get('.markdown-body')

    cy.get(
      '[class^=DesktopToolBox_container] [class^=UserIcon_container]'
    ).click()

    cy.get('[class^=UserModal_content]').get(
      '[class^=Bio]:not(data-is-loading)'
    )
  })
})
