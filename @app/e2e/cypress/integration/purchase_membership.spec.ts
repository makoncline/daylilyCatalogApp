// purchase_membership.spec.ts created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test
/* ==== Test Created with Cypress Studio ==== */
context("buy membership", () => {
  beforeEach(() => {
    cy.serverCommand("clearTestUsers");
  });

  it("get started when logged out navigates to register", () => {
    cy.visit("http://localhost:5678/");
    cy.get("[data-cy=get-started-for-free]").click();
    cy.get("[data-cy=layout-header-title]").should("contain", "Register");
  });

  it("get started when logged in navigates to catalog", () => {
    cy.login({ next: "/", verified: true });
    cy.visit("http://localhost:5678/");
    cy.get("[data-cy=get-started-for-free]").click();
    cy.get("[data-cy=layout-header-title]").should("contain", "Catalog");
  });

  it("pricing leads to pricing page", () => {
    cy.visit("http://localhost:5678/");
    cy.get("[data-cy=pricing]").click();
    cy.get("[data-cy=layout-header-title]").should("contain", "Pricing");
  });

  it("become a member leads to pricing page", () => {
    cy.visit("http://localhost:5678/");
    cy.get("[data-cy=become-a-member]").click();
    cy.get("[data-cy=layout-header-title]").should("contain", "Pricing");
  });

  it("pricing page free leads to login when logged out", () => {
    cy.visit("http://localhost:5678/pricing");
    cy.get("[data-cy=free]").click();
    cy.get("[data-cy=layout-header-title]").should("contain", "Sign in");
  });

  it("pricing page free leads to catalog when logged in", () => {
    cy.login({ next: "/", verified: true });
    cy.visit("http://localhost:5678/pricing");
    cy.get("[data-cy=free]").click();
    cy.get("[data-cy=layout-header-title]").should("contain", "Catalog");
  });

  it("pricing page membership leads to login when not logged in", () => {
    cy.visit("http://localhost:5678/pricing");
    cy.get("[data-cy=get-membership]").click();
    cy.wait(5000);
    cy.get("[data-cy=layout-header-title]").should("contain", "Sign in");
  });

  it("pricing page membership leads to membership when logged in", () => {
    cy.login({ next: "/", verified: true });
    cy.visit("http://localhost:5678/pricing");
    cy.get("[data-cy=get-membership]").click();
    cy.get("[data-cy=layout-header-title]").should("contain", "Membership");
  });

  it("membership page purchase button disabled when not verified", () => {
    cy.login({ next: "/", verified: false });
    cy.visit("http://localhost:5678/membership");
    cy.get("[data-cy=view-email-settings]").should("exist");
    cy.get("[data-cy=checkout]").should("not.exist");
  });

  it("membership page purchase button active when verified", () => {
    cy.login({ next: "/", verified: true });
    cy.visit("http://localhost:5678/membership");
    cy.get("[data-cy=checkout]").should("exist");
    cy.get("[data-cy=view-email-settings]").should("not.exist");
  });
});
