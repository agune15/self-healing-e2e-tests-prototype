// Simple custom commands for practice automation testing

// Basic input actions
Cypress.Commands.add('typeUsername', (username) => {
  cy.get('#username').type(username);
});

Cypress.Commands.add('typePassword', (password) => {
  cy.get('#password').type(password);
});

Cypress.Commands.add('clickSubmitButton', () => {
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('clickLogoutLink', () => {
  cy.get('a[href="/logout"]').click();
});

// Flash message verification
Cypress.Commands.add('verifyFlashContains', (message) => {
  cy.get('#flash').should('be.visible').and('contain', message);
});

// Form input actions
Cypress.Commands.add('typeNumberInput', (value) => {
  cy.get('input[type="number"]').clear().type(value);
});

Cypress.Commands.add('typeTextInput', (value) => {
  cy.get('input[type="text"]').clear().type(value);
});

Cypress.Commands.add('typePasswordInput', (value) => {
  cy.get('input[type="password"]').clear().type(value);
});

Cypress.Commands.add('typeDateInput', (value) => {
  cy.get('input[type="date"]').clear().type(value);
});

// Checkbox actions
Cypress.Commands.add('checkFirstCheckbox', () => {
  cy.get('input[type="checkbox"]').first().check();
});

Cypress.Commands.add('uncheckLastCheckbox', () => {
  cy.get('input[type="checkbox"]').last().uncheck();
});

// Dropdown actions
Cypress.Commands.add('selectDropdownOption', (option) => {
  cy.get('#dropdown').select(option);
});

// Element manipulation
Cypress.Commands.add('clickAddElementButton', () => {
  cy.get('button[onclick="addElement()"]').click();
});

Cypress.Commands.add('clickRemoveButton', () => {
  cy.get('.added-manually').first().click();
});

// Verification helpers
Cypress.Commands.add('verifyInputValue', (selector, value) => {
  cy.get(selector).should('have.value', value);
});

Cypress.Commands.add('verifyElementCount', (selector, count) => {
  cy.get(selector).children().should('have.length', count);
});

Cypress.Commands.add('verifyUrlIncludes', (urlPart) => {
  cy.url().should('include', urlPart);
});

Cypress.Commands.add('verifyCheckboxChecked', (selector) => {
  cy.get(selector).should('be.checked');
});

Cypress.Commands.add('verifyCheckboxUnchecked', (selector) => {
  cy.get(selector).should('not.be.checked');
});
