export function acceptCookies() {
  cy.get('body').then($body => {
    if ($body.find(SELECTORS.buttons.acceptAllButton).length > 0) {
      cy.get(SELECTORS.buttons.acceptAllButton).click();
    }
  });
}
