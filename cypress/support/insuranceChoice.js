import SELECTORS from './constants/selectors';

export function selectInsuranceTypeAndStartDate(typeSelector, insuranceType, ingressDate) {
  cy.clickRadioButtonWithText(typeSelector, insuranceType);
  cy.selectDropdownOption(SELECTORS.ingressDateSelect, ingressDate);
  cy.clickButton(SELECTORS.buttons.insuranceContinueButton);
}

export function selectOccupationalStatusAndInputIncome(statusSelector, employmentType, income) {
  cy.clickRadioButtonWithText(statusSelector, employmentType);
  cy.typeInput(SELECTORS.incomeInput, income);
  cy.clickButton(SELECTORS.buttons.employmentContinueButton);
}
