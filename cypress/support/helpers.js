import SELECTORS from './constants/selectors';

export function inputDate(date) {
  cy.typeInput(SELECTORS.inputs.dayInput, date.day);
  cy.typeInput(SELECTORS.inputs.monthInput, date.month);
  cy.typeInput(SELECTORS.inputs.yearInput, date.year);
}
