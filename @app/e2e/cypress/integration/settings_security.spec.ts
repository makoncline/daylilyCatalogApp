/// <reference types="Cypress" />

context("Settings after the supported runtime update", () => {
  beforeEach(() => cy.serverCommand("clearTestUsers"));

  it("restores dialog focus and persists avatar removal", () => {
    cy.login({
      username: "testuser",
      verified: true,
      next: "/settings/delete",
    });
    cy.contains("button", "I want to delete my account")
      .as("openDialog")
      .click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("button", "Cancel").should("be.focused");
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
    cy.get("@openDialog").should("be.focused");

    cy.visit(Cypress.config("baseUrl") + "/settings");
    cy.document().then((document) => {
      const data = JSON.parse(
        document.getElementById("__NEXT_DATA__").textContent
      );
      const headers = { "CSRF-Token": data.props.csrfToken };
      cy.request({
        method: "POST",
        url: "/graphql",
        headers,
        body: { query: "query { currentUser { id } }" },
      }).then(({ body }) => {
        const id = body.data.currentUser.id;
        const bucket = data.props.publicRuntimeConfig.S3_UPLOAD_BUCKET;
        const avatarUrl =
          "https://" +
          bucket +
          ".s3.amazonaws.com/avatar/" +
          id +
          "/67cac85c-2e81-4eb5-8859-1f7475d2b76f";
        cy.request({
          method: "POST",
          url: "/graphql",
          headers,
          body: {
            query:
              "mutation($id: Int!, $url: String!) { updateUser(input: {id: $id, patch: {avatarUrl: $url}}) { user { avatarUrl } } }",
            variables: { id, url: avatarUrl },
          },
        })
          .its("body")
          .should("not.have.property", "errors");
      });
    });
    cy.reload();
    cy.contains("button", "Edit image").click();
    cy.intercept("POST", "/graphql", (request) => {
      if (
        request.body.operationName === "UpdateUser" &&
        request.body.variables.patch.avatarUrl === null
      ) {
        request.alias = "avatarRemoved";
      }
    });
    cy.contains("button", "×").click();
    cy.wait("@avatarRemoved")
      .its("response.body.data.updateUser.user.avatarUrl")
      .should("be.null");
    cy.contains("button", "Edit image").should("not.exist");
    cy.reload();
    cy.contains("button", "Edit image").should("not.exist");
    cy.document().then((document) => {
      const data = JSON.parse(
        document.getElementById("__NEXT_DATA__").textContent
      );
      cy.request({
        method: "POST",
        url: "/graphql",
        headers: { "CSRF-Token": data.props.csrfToken },
        body: { query: "query { currentUser { avatarUrl } }" },
      })
        .its("body.data.currentUser.avatarUrl")
        .should("be.null");
    });

    cy.intercept(/https:\/\/[^/]+\.amazonaws\.com\/avatar\//, (request) => {
      if (request.method === "PUT") {
        expect(request.headers["content-type"]).to.equal("image/png");
        request.alias = "avatarUpload";
      }
      request.reply({
        statusCode: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "PUT, OPTIONS",
          "access-control-allow-headers": "content-type",
        },
      });
    });
    cy.get('input[type="file"]')
      .first()
      .selectFile(
        {
          contents: Cypress.Buffer.from("fixture-png-bytes"),
          fileName: "avatar.png",
          mimeType: "image/png",
        },
        { force: true }
      );
    cy.contains("button", "Upload", { exact: true }).click();
    cy.wait("@avatarUpload");
    cy.contains("button", "Edit image").should("exist");
  });
});
