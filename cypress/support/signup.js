export function seeComprehensiveSignupPage() {
  cy.assertTextIsVisible("Los geht's. Wie lautet deine E-Mail-Adresse?");
  cy.urlIncludes('/registration/email?origin=comprehensive');
}
