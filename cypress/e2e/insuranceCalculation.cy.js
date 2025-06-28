import SELECTORS from '../support/selectors';

describe('Online Beitragsrechner', () => {
  before(() => {
    // Load fixtures
    cy.fixture('insuranceCalculation/inputData.json').as('inputData');
    cy.fixture('insuranceCalculation/birthDateErrors.json').as('birthDateErrors');
  });

  it('should complete the insurance calculation process', function () {
    // Step 1: Visit the Ottonova Beitragsrechner page
    cy.visit('/online-beitragsrechner');

    // Step 2: Accept the cookie banner if it appears
    cy.get('body').then($body => {
      if ($body.find(SELECTORS.acceptAllButton).length > 0) {
        cy.get(SELECTORS.acceptAllButton).click();
      }
    });

    // Step 3: Select employment type and enter income
    cy.clickRadioButtonWithText(SELECTORS.employmentStatusOptionEmployed, this.inputData.employmentType);
    cy.typeInput(SELECTORS.incomeInput, this.inputData.income);
    cy.clickButton(SELECTORS.employmentContinueButton);

    // Step 4: Select insurance type and start date
    cy.clickRadioButtonWithText(SELECTORS.fullInsurance, this.inputData.insuranceType);
    cy.selectDropdownOption(SELECTORS.ingressDateSelect, this.inputData.ingressDate);
    cy.clickButton(SELECTORS.insuranceContinueButton);

    // Step 5: Assert birthdate input field error messages

    // Invalid date
    cy.typeInput(SELECTORS.dayInput, this.inputData.birthDates.invalidDate.day);
    cy.typeInput(SELECTORS.monthInput, this.inputData.birthDates.invalidDate.month);
    cy.typeInput(SELECTORS.yearInput, this.inputData.birthDates.invalidDate.year);
    cy.assertTextIsVisible(SELECTORS.invalidAgeValidationMessage, this.birthDateErrors.invalidDate);
    cy.assertButtonIsDisabled(SELECTORS.birthdayContinueButton);

    // Future date
    cy.typeInput(SELECTORS.dayInput, this.inputData.birthDates.futureDate.day);
    cy.typeInput(SELECTORS.monthInput, this.inputData.birthDates.futureDate.month);
    cy.typeInput(SELECTORS.yearInput, this.inputData.birthDates.futureDate.year);
    cy.assertTextIsVisible(SELECTORS.negativeAgeValidationMessage, this.birthDateErrors.futureDate);
    cy.assertButtonIsDisabled(SELECTORS.birthdayContinueButton);

    // Person older than 101 y.o.
    cy.typeInput(SELECTORS.dayInput, this.inputData.birthDates.olderThan101.day);
    cy.typeInput(SELECTORS.monthInput, this.inputData.birthDates.olderThan101.month);
    cy.typeInput(SELECTORS.yearInput, this.inputData.birthDates.olderThan101.year);
    cy.assertTextIsVisible(SELECTORS.invalidAgeValidationMessage, this.birthDateErrors.olderThan101);
    cy.assertButtonIsDisabled(SELECTORS.birthdayContinueButton);

    // Person younger than 16 y.o.
    cy.typeInput(SELECTORS.dayInput, this.inputData.birthDates.youngerThan16.day);
    cy.typeInput(SELECTORS.monthInput, this.inputData.birthDates.youngerThan16.month);
    cy.typeInput(SELECTORS.yearInput, this.inputData.birthDates.youngerThan16.year);
    cy.assertTextIsVisible(SELECTORS.invalidAgeValidationMessage, this.birthDateErrors.youngerThan16);
    cy.assertButtonIsDisabled(SELECTORS.birthdayContinueButton);

    // Step 6: Enter a valid birthdate and proceed to the next page
    cy.typeInput(SELECTORS.dayInput, this.inputData.birthDates.validDate.day);
    cy.typeInput(SELECTORS.monthInput, this.inputData.birthDates.validDate.month);
    cy.typeInput(SELECTORS.yearInput, this.inputData.birthDates.validDate.year);
    cy.clickButton(SELECTORS.birthdayContinueButton);
  });
});
