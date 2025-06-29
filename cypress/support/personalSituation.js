import SELECTORS from './constants/selectors';

export function inputBirthDate(day, month, year) {
  cy.typeInput(SELECTORS.dayInput, day);
  cy.typeInput(SELECTORS.monthInput, month);
  cy.typeInput(SELECTORS.yearInput, year);
  cy.clickButton(SELECTORS.birthdayContinueButton);
}

export function inputInvalidBirthDateAndAssertError(day, month, year, errorMessage) {
  cy.typeInput(SELECTORS.dayInput, day);
  cy.typeInput(SELECTORS.monthInput, month);
  cy.typeInput(SELECTORS.yearInput, year);
  cy.assertTextIsVisible(SELECTORS.invalidAgeValidationMessage, errorMessage);
  cy.assertButtonIsDisabled(SELECTORS.buttons.birthdayContinueButton);
}

export function selectCurrentInsuranceType(typeSelector, currentInsuranceType) {
  cy.clickRadioButtonWithText(typeSelector, currentInsuranceType);
  cy.clickButton(SELECTORS.buttons.insuranceContinueButton);
}
