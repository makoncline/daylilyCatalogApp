context("buy membership", () => {
  beforeEach(() => cy.serverCommand("clearTestUsers"));

  it("get started when logged out navigates to register", () => {
    cy.visit(Cypress.env("ROOT_URL"));
    cy.get("[data-cy=get-started-for-free]").click();
    cy.url({ timeout: 20000 }).should("contain", "/login");
    cy.getCy("header-login-button").should("not.exist");
    cy.getCy("header-logout-button").should("not.exist");
  });

  it("get started when logged in navigates to catalog", () => {
    cy.login({ next: "/", verified: true });
    cy.get("[data-cy=get-started-for-free]").click();
    cy.url({ timeout: 20000 }).should("contain", "/catalog");
    cy.getCy("header-login-button").should("not.exist");
    cy.getCy("header-logout-button").should("exist");
  });

  it("pricing leads to pricing page", () => {
    cy.visit(Cypress.env("ROOT_URL"));
    cy.get("[data-cy=pricing]").click();
    cy.url({ timeout: 20000 }).should("contain", "/pricing");
    cy.get("[data-cy=layout-header-title]").should("contain", "Pricing");
  });

  it("become a member leads to pricing page", () => {
    cy.visit(Cypress.env("ROOT_URL"));
    cy.get("[data-cy=become-a-member]").click();
    cy.url({ timeout: 20000 }).should("contain", "/pricing");
    cy.get("[data-cy=layout-header-title]").should("contain", "Pricing");
  });

  it("pricing page free leads to login when logged out", () => {
    cy.visit(Cypress.env("ROOT_URL") + "/pricing");
    cy.get("[data-cy=free]").click();
    cy.url({ timeout: 20000 }).should("contain", "/login");
    cy.get("[data-cy=layout-header-title]").should("contain", "Sign in");
  });

  it("pricing page free leads to catalog when logged in", () => {
    cy.login({ next: "/pricing", verified: true });
    cy.get("[data-cy=free]").click();
    cy.url({ timeout: 20000 }).should("contain", "/catalog");
    cy.get("[data-cy=layout-header-title]").should("contain", "Catalog");
  });

  it("pricing page membership leads to login when not logged in", () => {
    cy.visit(Cypress.env("ROOT_URL") + "/pricing");
    cy.get("[data-cy=get-membership]").click();
    cy.url({ timeout: 20000 }).should("contain", "/login");
    cy.get("[data-cy=layout-header-title]").should("contain", "Sign in");
  });

  it("pricing page membership leads to membership when logged in", () => {
    cy.login({ next: "/pricing", verified: true });
    cy.get("[data-cy=get-membership]").click();
    cy.url({ timeout: 20000 }).should("contain", "/membership");
    cy.get("[data-cy=layout-header-title]").should("contain", "Membership");
  });

  it("membership page purchase button disabled when not verified", () => {
    cy.login({ next: "/membership", verified: false });
    cy.get("[data-cy=view-email-settings]").should("exist");
    cy.get("[data-cy=checkout]").should("not.exist");
  });

  it("membership page purchase button active when verified", () => {
    cy.login({ next: "/membership", verified: true });
    cy.get("[data-cy=checkout]").should("exist");
    cy.get("[data-cy=view-email-settings]").should("not.exist");
  });
});
