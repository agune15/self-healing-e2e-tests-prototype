import SELECTORS from './constants/selectors';

export function inputDate(date) {
  cy.typeInput(SELECTORS.dayInput, date.day);
  cy.typeInput(SELECTORS.monthInput, date.month);
  cy.typeInput(SELECTORS.yearInput, date.year);
}
