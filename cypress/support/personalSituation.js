import SELECTORS from './constants/selectors';

export function insureChild(isParent = false, childBirthDate = {}) {
  if (isParent) {
    cy.clickRadioButtonWithText(SELECTORS.insureChildrenButton, 'ein Kind mit versichern');
    cy.typeInput(SELECTORS.dayInput, childBirthDate.day);
    cy.typeInput(SELECTORS.monthInput, childBirthDate.month);
    cy.typeInput(SELECTORS.yearInput, childBirthDate.year);
    cy.clickButton(SELECTORS.buttons.childrenWithKidsContinueButton);
  } else {
    cy.clickRadioButtonWithText(SELECTORS.noChildrenButton, 'kein Kind versichern');
    cy.clickButton(SELECTORS.buttons.childrenNoKidsContinue);
  }
}

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
