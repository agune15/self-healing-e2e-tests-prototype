import SELECTORS from './constants/selectors';
import { inputDate } from './helpers';

export function insureChild(isParent = false, childBirthDate = {}) {
  cy.assertTextIsVisible('Hast du Kinder, die du mitversichern willst?');
  if (isParent) {
    cy.clickRadioButtonWithText(SELECTORS.insureChildrenButton, 'ein Kind mit versichern');
    inputDate(childBirthDate);
    cy.clickButton(SELECTORS.buttons.childrenWithKidsContinueButton);
  } else {
    cy.clickRadioButtonWithText(SELECTORS.noChildrenButton, 'kein Kind versichern');
    cy.clickButton(SELECTORS.buttons.childrenNoKidsContinue);
  }
}

export function inputBirthDate(date) {
  cy.assertTextIsVisible('Wann bist du geboren?');
  inputDate(date);
  cy.clickButton(SELECTORS.buttons.birthdayContinueButton);
}

export function inputInvalidBirthDate(date, errorMessage) {
  cy.assertTextIsVisible('Wann bist du geboren?');
  inputDate(date);
  cy.assertTextIsVisible(errorMessage);
  cy.assertButtonIsDisabled(SELECTORS.buttons.birthdayContinueButton);
}

export function selectCurrentInsuranceType(typeSelector, currentInsuranceType) {
  cy.assertTextIsVisible('Wie bist du aktuell versichert?');
  cy.clickRadioButtonWithText(typeSelector, currentInsuranceType);
  cy.clickButton(SELECTORS.buttons.insuranceStatusContinueButton);
}
