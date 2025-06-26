describe("Online Beitragsrechner", () => {
  before(() => {
    // Load fixtures
    cy.fixture("insuranceCalculation/inputData.json").as("inputData");
    cy.fixture("insuranceCalculation/birthDateErrors.json").as(
      "birthDateErrors"
    );
    cy.fixture("insuranceCalculation/selectors.json").as("selectors");
  });

  it("should complete the insurance calculation process", function () {
    // Step 1: Visit the Ottonova Beitragsrechner page
    cy.visit(`${Cypress.env("baseURL")}/online-beitragsrechner`);

    // Step 2: Accept the cookie banner if it appears
    cy.get("body").then(($body) => {
      if ($body.find(this.selectors.acceptAllButton).length > 0) {
        cy.get(this.selectors.acceptAllButton).click();
      }
    });

    // Step 3: Select employment type and enter income
    cy.contains(
      this.selectors.insuranceTypeLabel,
      this.inputData.employmentType
    ).click();
    cy.get(this.selectors.incomeInput).type(this.inputData.income);
    cy.get(this.selectors.employmentContinueButton).click();

    // Step 4: Select insurance type and start date
    cy.contains(
      this.selectors.insuranceTypeLabel,
      this.inputData.insuranceType
    ).click();
    cy.get(this.selectors.ingressDateSelect).select(this.inputData.ingressDate);
    cy.get(this.selectors.insuranceContinueButton).click();

    // Step 5: Assert birthdate input field error messages

    // Invalid date
    cy.get(this.selectors.dayInput).type(
      this.inputData.birthDates.invalidDate.day
    );
    cy.get(this.selectors.monthInput).type(
      this.inputData.birthDates.invalidDate.month
    );
    cy.get(this.selectors.yearInput).type(
      this.inputData.birthDates.invalidDate.year
    );
    cy.get(this.selectors.invalidAgeValidationMessage).should(
      "contain",
      this.birthDateErrors.invalidDate
    );
    cy.get(this.selectors.birthdayContinueButton).should("be.disabled");

    // Future date
    cy.get(this.selectors.dayInput)
      .clear()
      .type(this.inputData.birthDates.futureDate.day);
    cy.get(this.selectors.monthInput)
      .clear()
      .type(this.inputData.birthDates.futureDate.month);
    cy.get(this.selectors.yearInput)
      .clear()
      .type(this.inputData.birthDates.futureDate.year);
    cy.get(this.selectors.negativeAgeValidationMessage).should(
      "contain",
      this.birthDateErrors.futureDate
    );
    cy.get(this.selectors.birthdayContinueButton).should("be.disabled");

    // Person older than 101 y.o.
    cy.get(this.selectors.dayInput)
      .clear()
      .type(this.inputData.birthDates.olderThan101.day);
    cy.get(this.selectors.monthInput)
      .clear()
      .type(this.inputData.birthDates.olderThan101.month);
    cy.get(this.selectors.yearInput)
      .clear()
      .type(this.inputData.birthDates.olderThan101.year);
    cy.get(this.selectors.invalidAgeValidationMessage).should(
      "contain",
      this.birthDateErrors.olderThan101
    );
    cy.get(this.selectors.birthdayContinueButton).should("be.disabled");

    // Person younger than 16 y.o.
    cy.get(this.selectors.dayInput)
      .clear()
      .type(this.inputData.birthDates.youngerThan16.day);
    cy.get(this.selectors.monthInput)
      .clear()
      .type(this.inputData.birthDates.youngerThan16.month);
    cy.get(this.selectors.yearInput)
      .clear()
      .type(this.inputData.birthDates.youngerThan16.year);
    cy.get(this.selectors.invalidAgeValidationMessage).should(
      "contain",
      this.birthDateErrors.youngerThan16
    );
    cy.get(this.selectors.birthdayContinueButton).should("be.disabled");

    // Step 6: Enter a valid birthdate and proceed to the next page
    cy.get(this.selectors.dayInput)
      .clear()
      .type(this.inputData.birthDates.validDate.day);
    cy.get(this.selectors.monthInput)
      .clear()
      .type(this.inputData.birthDates.validDate.month);
    cy.get(this.selectors.yearInput)
      .clear()
      .type(this.inputData.birthDates.validDate.year);
    cy.get(this.selectors.birthdayContinueButton).click();
  });
});
