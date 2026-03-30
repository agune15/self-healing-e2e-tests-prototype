import * as practiceActions from '../support/practiceActions';

describe('Practice Automation Testing', () => {
  it('Should perform successful login flow', () => {
    cy.visit('/login');
    
    practiceActions.loginUser();
    practiceActions.verifyLoginSuccess();
    practiceActions.logoutUser();
  });

  it('Should handle invalid login credentials', () => {
    cy.visit('/login');
    
    practiceActions.loginUser('invaliduser', 'wrongpassword');
    practiceActions.verifyLoginFailure();
  });

  it('Should interact with form elements', () => {
    cy.visit('/inputs');
    
    practiceActions.fillFormInputs('42', 'Hello Cypress', 'SecretPassword123', '2024-12-01');
    practiceActions.verifyFormInputs('42', 'Hello Cypress', '2024-12-01');
  });

  it('Should handle checkboxes', () => {
    cy.visit('/checkboxes');
    
    practiceActions.interactWithCheckboxes();
  });

  it('Should interact with dropdowns', () => {
    cy.visit('/dropdown');
    
    practiceActions.selectDropdownOption('Option 1');
    practiceActions.verifyDropdownValue('1');
    
    practiceActions.selectDropdownOption('Option 2');
    practiceActions.verifyDropdownValue('2');
  });

  it('Should test add/remove elements', () => {
    cy.visit('/add-remove-elements');
    
    practiceActions.verifyElementCount(0);
    
    practiceActions.addElements(2);
    practiceActions.verifyElementCount(2);
    
    practiceActions.removeFirstElement();
    practiceActions.verifyElementCount(1);
  });

  it('Should handle hover interactions', () => {
    cy.visit('/hovers');
    
    cy.get('.figure').first().trigger('mouseover');
    cy.get('.figure').first().find('.figcaption').invoke('css', 'display', 'block').should('have.css', 'display', 'block');
  });

  it('Should handle JavaScript alerts', () => {
    cy.visit('/js-alerts');
    
    cy.window().then(win => {
      cy.stub(win, 'alert').as('alert');
    });
    
    cy.get('button[onclick="jsAlert()"]').click();
    cy.get('@alert').should('have.been.called');
  });

  it('Should verify page title and basic navigation', () => {
    cy.visit('/');
    cy.title().should('contain', 'Automation Testing Practice Website');
    
    cy.get('a[href="/login"]').should('be.visible');
    cy.get('a[href="/checkboxes"]').should('be.visible');
    cy.get('a[href="/dropdown"]').should('be.visible');
  });
});