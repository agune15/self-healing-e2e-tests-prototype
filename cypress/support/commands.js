Cypress.Commands.add('assertButtonIsDisabled', selector => {
  cy.getElement(selector).should('be.disabled');
});

Cypress.Commands.add('assertTextIsVisible', text => {
  cy.contains(text).should('be.visible');
});

Cypress.Commands.add('clickButton', (selector, options, index) => {
  (typeof index === 'number' ? cy.getElement(selector).eq(index) : cy.getElement(selector).first()).click({
    ...options,
  });
});

Cypress.Commands.add('clickOptionWithText', (selector, text) => {
  cy.getElement(selector).contains(text).click();
});

Cypress.Commands.add('clickRadioButtonWithText', (selector, text) => {
  cy.get(`label[data-cy="${selector}"]`).contains(text).click();
});

Cypress.Commands.add('getElement', (selector, options) => {
  return cy.get(`[data-cy="${selector}"]`, options);
});

Cypress.Commands.add('selectDropdownOption', (selector, value) => {
  cy.getElement(selector).should('be.visible').select(value);
});

Cypress.Commands.add('typeInput', (selector, value, options) => {
  cy.get(`input[data-cy="${selector}"]`).should('be.visible').clear().type(value, options);
});

Cypress.Commands.add('urlIncludes', url => {
  cy.url().should('include', url);
});
