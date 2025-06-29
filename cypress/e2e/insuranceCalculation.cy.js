import SELECTORS from '../support/constants/selectors';
import * as page from '../support/page';
import * as insuranceChoice from '../support/insuranceChoice';
import * as personalSituation from '../support/personalSituation';
import * as tariffOptions from '../support/tariffOptions';
import * as signup from '../support/signup';

describe('Online Beitragsrechner', () => {
  before(() => {
    cy.fixture('insuranceCalculation/inputData.json').as('inputData');
    cy.fixture('insuranceCalculation/birthDateErrors.json').as('birthDateErrors');
  });

  it('Employed - Public insurance - 1 child', function () {
    cy.visit('/online-beitragsrechner');
    page.acceptCookies();
    insuranceChoice.selectOccupationalStatus(SELECTORS.employmentStatusOptionEmployed, this.inputData.employmentType);
    insuranceChoice.inputIncome(this.inputData.income);
    insuranceChoice.selectInsuranceType(SELECTORS.fullInsurance, this.inputData.insuranceType);
    insuranceChoice.selectInsuranceStartDate(this.inputData.ingressDate);
    personalSituation.inputInvalidBirthDate(this.inputData.birthDates.invalidDate, this.birthDateErrors.invalidDate);
    personalSituation.inputInvalidBirthDate(this.inputData.birthDates.futureDate, this.birthDateErrors.futureDate);
    personalSituation.inputInvalidBirthDate(this.inputData.birthDates.olderThan101, this.birthDateErrors.olderThan101);
    personalSituation.inputInvalidBirthDate(
      this.inputData.birthDates.youngerThan16,
      this.birthDateErrors.youngerThan16
    );
    personalSituation.inputBirthDate(this.inputData.birthDates.validDate);
    personalSituation.selectCurrentInsuranceType(
      SELECTORS.insuranceStatusStatutory,
      this.inputData.currentInsuranceType
    );
    personalSituation.insureChild(this.inputData.isParent, this.inputData.birthDates.childDate);
    tariffOptions.selectRecommendedTariffOption();
    tariffOptions.selectTariff(this.inputData.tariffName);
    tariffOptions.setDailySicknessAllowance(this.inputData.dailySicknessAllowance);
    tariffOptions.setPremiumReductionContribution(this.inputData.premiumReductionContribution);
    tariffOptions.assertMonthlyPayment(this.inputData.monthlyPayment);
    tariffOptions.continueWithSignup();
    signup.seeComprehensiveSignupPage();
  });
});
