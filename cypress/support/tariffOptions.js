import SELECTORS from './constants/selectors';

export function assertMonthlyPayment(amount) {
  cy.assertTextIsVisible('Du zahlst monatlich — Gesamt');
  cy.assertTextIsVisible(amount);
}

export function continueWithSignup() {
  cy.clickButton(SELECTORS.buttons.birthdayContinueButton);
}

export function selectRecommendedTariffOption() {
  cy.assertTextIsVisible('Weiter geht’s mit den Tarifoptionen');
  cy.clickButton(SELECTORS.buttons.tariffOptionsRecommendedContinue);
}

export function selectTariff(tariffName) {
  cy.assertTextIsVisible('Klasse, hier dein Angebot');
  cy.getElement(SELECTORS.tariffTitle).each($el => {
    const text = $el.text().replace(/\s+/g, ' ').trim();
    const normalizedText = text.replace(/([a-z])([A-Z])/g, '$1 $2');

    if (normalizedText === tariffName) {
      cy.wrap($el).click();
    }
  });
}

export function setDailySicknessAllowance(amount) {
  cy.assertTextIsVisible('Krankentagegeld');
  cy.typeInput(SELECTORS.dailySicknessAllowanceInput, amount);
}
