/// <reference types="Cypress" />

context("HomePage", () => {
  it("renders correctly", () => {
    // Setup
    cy.visit(Cypress.config("baseUrl"));

    // Action

    // Assertions
    cy.url().should("equal", Cypress.config("baseUrl") + "/");
    cy.getCy("header-login-button").should("exist");
    cy.getCy("homepage-header").should("exist");
  });
});
