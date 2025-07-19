import SELECTORS from './constants/selectors';

export function inputIncome(income) {
  cy.assertTextIsVisible('Wie hoch ist dein Bruttojahresgehalt?');
  cy.typeInput(SELECTORS.inputs.incomeInput, income);
  cy.clickButton(SELECTORS.buttons.employmentContinueButton);
}

export function selectInsuranceStartDate(ingressDate) {
  cy.assertTextIsVisible('Wann soll deine Versicherung starten?');
  cy.selectDropdownOption(SELECTORS.selectors.ingressDateSelect, ingressDate);
  cy.clickButton(SELECTORS.buttons.insuranceContinueButton);
}

export function selectInsuranceProduct(productSelector, insuranceProduct) {
  cy.assertTextIsVisible('Für welche Krankenversicherung interessierst du dich?');
  cy.clickOptionWithText(productSelector, insuranceProduct);
}

export function selectOccupationalStatus(statusSelector, employmentType) {
  cy.assertTextIsVisible('Wie ist dein Berufsstatus?');
  cy.clickRadioButtonWithText(statusSelector, employmentType);
}
