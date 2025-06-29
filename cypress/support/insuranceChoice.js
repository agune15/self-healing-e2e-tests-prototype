import SELECTORS from './constants/selectors';

export function inputIncome(income) {
  cy.assertTextIsVisible('Wie hoch ist dein Bruttojahresgehalt?');
  cy.typeInput(SELECTORS.incomeInput, income);
  cy.clickButton(SELECTORS.buttons.employmentContinueButton);
}

export function selectInsuranceStartDate(ingressDate) {
  cy.assertTextIsVisible('Wann soll deine Versicherung starten?');
  cy.selectDropdownOption(SELECTORS.ingressDateSelect, ingressDate);
  cy.clickButton(SELECTORS.buttons.insuranceContinueButton);
}

export function selectInsuranceType(typeSelector, insuranceType, ingressDate) {
  cy.assertTextIsVisible('Für welche Krankenversicherung interessierst du dich?');
  cy.clickRadioButtonWithText(typeSelector, insuranceType);
}

export function selectOccupationalStatus(statusSelector, employmentType) {
  cy.assertTextIsVisible('Wie ist dein Berufsstatus?');
  cy.clickRadioButtonWithText(statusSelector, employmentType);
}
