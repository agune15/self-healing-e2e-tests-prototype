const SELECTORS = {
  buttons: {
    acceptAllButton: "[data-testid='uc-accept-all-button']",
    birthdayContinueButton: 'birthday-continue',
    childrenNoKidsContinue: 'children-no-kids-continue',
    childrenWithKidsContinueButton: 'children-with-kids-continue',
    employmentContinueButton: 'employment-status-continue',
    insureChildrenButton: 'insure-children-button',
    insuranceContinueButton: 'insurance-product-continue',
    insuranceStatusContinueButton: 'insurance-status-continue',
    noChildrenButton: 'no-children-button',
    resultContinueWithSignup: 'result-continue-with-signup',
    tariffOptionsRecommendedContinue: 'tariff-options-recommended-continue',
    tariffSelectButton: '[data-cy="tariff-select-button"]',
  },
  selectors: {
    employmentStatusOptionEmployed: 'employment-status-option-employed',
    fullInsurance: 'full-insurance',
    ingressDateSelect: 'ingress-date',
    insuranceStatusStatutory: 'insurance-status-full',
  },
  inputs: {
    dailySicknessAllowanceInput: 'dsa-requested-payout-select',
    dayInput: 'day',
    incomeInput: 'income-input',
    monthInput: 'month',
    yearInput: 'year',
  },
  insuranceTypeLabel: 'label',
  invalidAgeValidationMessage: 'invalid-age-validation-message',
  negativeAgeValidationMessage: 'negative-age-validation-message',
  tariffTitle: 'tariff-title',
};

export default SELECTORS;
