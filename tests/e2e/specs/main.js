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

  it('can send message', () => {
    cy.visit('/channels/ci-e2e-test')

    const id = performance.now()
    const message = `e2e message send test ${id}`

    cy.get('[data-testid="message-input-textarea"]').type(message)

    cy.get('[data-testid="message-send-button"]').click()

    cy.contains('[data-testid="channel-viewport"]', message)
  })
})
