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

    cy.get('[data-testid="my-icon-button"]').click()

    cy.get('[data-testid="usermodal"]').get(
      '[data-testid="usermodal-bio"] [aria-busy=false]'
    )
  })
})
