/// <reference types="Cypress" />

context("Manage emails", () => {
  beforeEach(() => cy.serverCommand("clearTestUsers"));

  it("can navigate to reset password page", () => {
    // Setup
    cy.login({ next: "/", verified: true });

    // Action
    cy.getCy("link-settings").click();
    cy.url({ timeout: 20000 }).should(
      "equal",
      Cypress.env("ROOT_URL") + "/settings"
    );
    cy.getCy("settingslayout-link-password").click();

    // Assertion
    cy.url({ timeout: 20000 }).should(
      "equal",
      Cypress.env("ROOT_URL") + "/settings/security"
    );
  });

  it("can set new password", () => {
    const username = "testuser";
    const oldPassword = "password";
    const newPassword = "newpassword";
    cy.login({
      next: "/settings/security",
      verified: true,
      username: username,
      password: oldPassword,
    });
    cy.getCy("settings-security-input-old-password").type(oldPassword);
    cy.getCy("settings-security-input-new-password").type(newPassword);
    cy.getCy("settings-security-button-change-password").click();
    cy.contains("Password changed!").should("exist");
    cy.getCy("header-logout-button").click();
    cy.getCy("header-login-button").click();
    cy.getCy("loginpage-button-withusername").click();

    cy.getCy("loginpage-input-username").type(username);
    cy.getCy("loginpage-input-password").type(newPassword);
    cy.getCy("loginpage-button-submit").click();

    cy.url({ timeout: 10000 }).should("equal", Cypress.env("ROOT_URL") + "/"); // Should be on homepage
    cy.getCy("header-logout-button").should("exist"); // Should be logged in
  });

  // it("can add an email, verify it, make it primary, and delete original email", () => {
  //   const email = "newemail@example.com";
  //   // Setup
  //   cy.login({ next: "/settings/emails", verified: true });
  //   cy.contains("testuser@example.com", { timeout: 20000 }).should("exist");
  //   cy.contains("(unverified)").should("not.exist");

  //   // Action: add email
  //   cy.getCy("settingsemails-button-addemail").click();
  //   cy.getCy("settingsemails-input-email").type(email);
  //   cy.getCy("settingsemails-button-submit").click();

  //   // Assertion
  //   cy.getCy("settingsemails-emailitem-newemail-example-com").within(() => {
  //     cy.root().should("exist");
  //     cy.contains("newemail@example.com").should("exist");
  //     cy.contains("(unverified)").should("exist");
  //   });

  //   // Action: verify the email
  //   cy.serverCommand("getEmailSecrets", { email }).then((secrets) => {
  //     const { user_email_id, verification_token } = secrets;
  //     const url = `${Cypress.env("ROOT_URL")}/verify?id=${encodeURIComponent(
  //       user_email_id
  //     )}&token=${encodeURIComponent(verification_token!)}`;
  //     cy.visit(url);
  //     cy.contains("Email Verified").should("exist");
  //     cy.visit(Cypress.env("ROOT_URL") + "/settings/emails");
  //   });

  //   // Assertion
  //   cy.getCy("settingsemails-emailitem-testuser-example-com").within(() => {
  //     cy.root().should("exist");
  //     cy.getCy("settingsemails-indicator-primary").should("exist");
  //     cy.getCy("settingsemails-button-makeprimary").should("not.exist");
  //   });
  //   cy.getCy("settingsemails-emailitem-newemail-example-com").within(() => {
  //     cy.root().should("exist");
  //     cy.contains("newemail@example.com").should("exist");
  //     cy.contains("(unverified)").should("not.exist");
  //     cy.getCy("settingsemails-button-makeprimary").should("exist");
  //   });

  //   // Action: make new email primary
  //   cy.getCy("settingsemails-button-makeprimary").click();

  //   // Assertions
  //   cy.getCy("settingsemails-emailitem-testuser-example-com").within(() => {
  //     cy.root().should("exist");
  //     cy.getCy("settingsemails-indicator-primary").should("not.exist");
  //     cy.getCy("settingsemails-button-makeprimary").should("exist");
  //   });
  //   cy.getCy("settingsemails-emailitem-newemail-example-com").within(() => {
  //     cy.root().should("exist");
  //     cy.getCy("settingsemails-indicator-primary").should("exist");
  //     cy.getCy("settingsemails-button-makeprimary").should("not.exist");
  //   });

  //   // Action: delete old email
  //   cy.getCy("settingsemails-emailitem-testuser-example-com").within(() => {
  //     cy.getCy("settingsemails-button-delete").click();
  //   });

  //   // Assertions
  //   cy.getCy("settingsemails-emailitem-testuser-example-com").should(
  //     "not.exist"
  //   );
  // });
});
