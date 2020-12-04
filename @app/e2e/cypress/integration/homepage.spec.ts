/// <reference types="Cypress" />

context("HomePage", () => {
  it("renders correctly", () => {
    // Setup
    cy.visit(Cypress.env("ROOT_URL"));
    cy.wait(5000);

    // Action

    // Assertions
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/login?next=%2F");
    cy.getCy("header-login-button").should("exist");
  });
});
