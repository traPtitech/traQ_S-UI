describe('Login', () => {
  beforeEach(() => {
    cy.disableSW()
  })

  it('will show login page', () => {
    cy.visit('/')

    cy.contains('ログイン')
  })

  it('can login', () => {
    cy.visit('/')

    cy.get('form').within(() => {
      cy.get('input').eq(0).type(Cypress.env('username'))
      cy.get('input').eq(1).type(Cypress.env('password'))
      cy.get('input').eq(1).type('{enter}')
    })

    cy.contains('h2', /^#/)
  })
})
