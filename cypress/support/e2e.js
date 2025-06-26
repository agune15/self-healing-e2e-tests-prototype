import "./commands";

afterEach(function () {
  if (this.currentTest && this.currentTest.state === "failed") {
    cy.document().then((doc) => {
      const htmlSnapshot = doc.body.outerHTML;
      cy.task("saveHtmlSnapshot", {
        testName: this.currentTest.fullTitle(),
        html: htmlSnapshot,
      });
    });
  }
});
