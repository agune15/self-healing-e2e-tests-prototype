export function loginUser(username = 'practice', password = 'SuperSecretPassword!') {
  cy.typeUsername(username);
  cy.typePassword(password);
  cy.clickSubmitButton();
}

export function verifyLoginSuccess() {
  cy.verifyUrlIncludes('/secure');
  cy.verifyFlashContains('You logged into a secure area!');
}

export function verifyLoginFailure() {
  cy.verifyFlashContains('Your username is invalid!');
}

export function logoutUser() {
  cy.clickLogoutLink();
  cy.verifyFlashContains('You logged out of the secure area!');
}

export function fillFormInputs(numberValue, textValue, passwordValue, dateValue) {
  if (numberValue) cy.typeNumberInput(numberValue);
  if (textValue) cy.typeTextInput(textValue);
  if (passwordValue) cy.typePasswordInput(passwordValue);
  if (dateValue) cy.typeDateInput(dateValue);
}

export function verifyFormInputs(numberValue, textValue, dateValue) {
  if (numberValue) cy.verifyInputValue('input[type="number"]', numberValue);
  if (textValue) cy.verifyInputValue('input[type="text"]', textValue);
  if (dateValue) cy.verifyInputValue('input[type="date"]', dateValue);
}

export function interactWithCheckboxes() {
  cy.checkFirstCheckbox();
  cy.verifyCheckboxChecked('input[type="checkbox"]:first');
  cy.uncheckLastCheckbox();
  cy.verifyCheckboxUnchecked('input[type="checkbox"]:last');
}

export function selectDropdownOption(optionText) {
  cy.selectDropdownOption(optionText);
}

export function verifyDropdownValue(value) {
  cy.verifyInputValue('#dropdown', value);
}

export function addElements(count = 1) {
  for (let i = 0; i < count; i++) {
    cy.clickAddElementButton();
  }
}

export function removeFirstElement() {
  cy.clickRemoveButton();
}

export function verifyElementCount(expectedCount) {
  cy.verifyElementCount('#elements', expectedCount);
}