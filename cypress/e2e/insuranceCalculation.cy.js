import SELECTORS from '../support/constants/selectors';
import * as page from '../support/page';
import * as insuranceChoice from '../support/insuranceChoice';
import * as personalSituation from '../support/personalSituation';

describe('Online Beitragsrechner', () => {
  before(() => {
    cy.fixture('insuranceCalculation/inputData.json').as('inputData');
    cy.fixture('insuranceCalculation/birthDateErrors.json').as('birthDateErrors');
  });

  it('should complete the insurance calculation process', function () {
    cy.visit('/online-beitragsrechner');
    page.acceptCookies();
    insuranceChoice.selectOccupationalStatusAndInputIncome(
      SELECTORS.employmentStatusOptionEmployed,
      this.inputData.employmentType,
      this.inputData.income
    );
    insuranceChoice.selectInsuranceTypeAndStartDate(
      SELECTORS.fullInsurance,
      this.inputData.insuranceType,
      this.inputData.ingressDate
    );
    personalSituation.inputInvalidBirthDateAndAssertError(
      this.inputData.birthDates.invalidDate.day,
      this.inputData.birthDates.invalidDate.month,
      this.inputData.birthDates.invalidDate.year,
      this.birthDateErrors.invalidDate
    );
    personalSituation.inputInvalidBirthDateAndAssertError(
      this.inputData.birthDates.futureDate.day,
      this.inputData.birthDates.futureDate.month,
      this.inputData.birthDates.futureDate.year,
      this.birthDateErrors.futureDate
    );
    personalSituation.inputInvalidBirthDateAndAssertError(
      this.inputData.birthDates.olderThan101.day,
      this.inputData.birthDates.olderThan101.month,
      this.inputData.birthDates.olderThan101.year,
      this.birthDateErrors.olderThan101
    );
    personalSituation.inputInvalidBirthDateAndAssertError(
      this.inputData.birthDates.youngerThan16.day,
      this.inputData.birthDates.youngerThan16.month,
      this.inputData.birthDates.youngerThan16.year,
      this.birthDateErrors.youngerThan16
    );
    personalSituation.inputBirthDate(
      this.inputData.birthDates.validDate.day,
      this.inputData.birthDates.validDate.month,
      this.inputData.birthDates.validDate.year
    );
    personalSituation.selectCurrentInsuranceType(
      SELECTORS.insuranceStatusStatutory,
      this.inputData.currentInsuranceType
    );
    personalSituation.insureChild(this.inputData.isParent, this.inputData.childDate);
  });
});
