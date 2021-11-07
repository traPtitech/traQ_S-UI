// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    login(): undefined
    logout(): undefined
    disableSW(): undefined
  }
}

Cypress.Commands.add('login', () => {
  cy.request('POST', '/api/v3/login', {
    name: Cypress.env('username'),
    password: Cypress.env('password')
  })
})
Cypress.Commands.add('logout', () => {
  cy.request('POST', '/api/v3/logout')
})

// disable service workers
Cypress.Commands.add('disableSW', () => {
  Cypress.on('window:before:load', win => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (win.navigator as any).__proto__.serviceWorker
  })
})
