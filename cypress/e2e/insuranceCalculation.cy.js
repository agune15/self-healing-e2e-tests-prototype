import SELECTORS from '../support/constants/selectors';
import { INSURANCE_INPUT_DATA, BIRTH_DATE_ERRORS } from '../support/constants/insuranceCalculation';
import * as page from '../support/page';
import * as insuranceChoice from '../support/insuranceChoice';
import * as personalSituation from '../support/personalSituation';
import * as tariffOptions from '../support/tariffOptions';
import * as signup from '../support/signup';
import * as dateTime from '../support/dateTime';

describe('Online Beitragsrechner', () => {
  it('Employed - Public insurance - 1 child', () => {
    cy.visit('/online-beitragsrechner');
    page.acceptCookies();
    insuranceChoice.selectOccupationalStatus(
      SELECTORS.selectors.employmentStatusOptionEmployed,
      INSURANCE_INPUT_DATA.employmentType
    );
    insuranceChoice.inputIncome(INSURANCE_INPUT_DATA.income);
    insuranceChoice.selectInsuranceProduct('full-insurance', INSURANCE_INPUT_DATA.insuranceProduct);
    insuranceChoice.selectInsuranceStartDate(dateTime.getDateOfFirstDayOfTheMonthAfterNextMonth().date);
    personalSituation.inputInvalidBirthDate(INSURANCE_INPUT_DATA.birthDates.invalidDate, BIRTH_DATE_ERRORS.invalidDate);
    personalSituation.inputInvalidBirthDate(INSURANCE_INPUT_DATA.birthDates.futureDate, BIRTH_DATE_ERRORS.futureDate);
    personalSituation.inputInvalidBirthDate(
      INSURANCE_INPUT_DATA.birthDates.olderThan101,
      BIRTH_DATE_ERRORS.olderThan101
    );
    personalSituation.inputInvalidBirthDate(
      INSURANCE_INPUT_DATA.birthDates.youngerThan16,
      BIRTH_DATE_ERRORS.youngerThan16
    );
    personalSituation.inputBirthDate(INSURANCE_INPUT_DATA.birthDates.validDate);
    personalSituation.selectCurrentInsuranceType(
      SELECTORS.selectors.insuranceStatusStatutory,
      INSURANCE_INPUT_DATA.currentInsuranceType
    );
    personalSituation.insureChild(INSURANCE_INPUT_DATA.isParent, INSURANCE_INPUT_DATA.birthDates.childDate);
    tariffOptions.selectRecommendedTariffOption();
    tariffOptions.selectTariff(INSURANCE_INPUT_DATA.tariffName);
    tariffOptions.setDailySicknessAllowance(INSURANCE_INPUT_DATA.dailySicknessAllowance);
    tariffOptions.assertMonthlyPayment(INSURANCE_INPUT_DATA.monthlyPayment);
    tariffOptions.continueWithSignup();
    signup.seeComprehensiveSignupPage();
  });
});
