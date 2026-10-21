const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { mkdirSync, mkdtempSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

function check(documents) {
  const root = mkdtempSync(path.join(tmpdir(), "graphql-lint-"));
  try {
    mkdirSync(path.join(root, "data"));
    const directory = path.join(root, "@app/client/src/graphql");
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      path.join(root, "data/schema.graphql"),
      "type Item { id: ID!, nodeId: ID!, name: String } " +
        "type Other { name: String } union Choice = Item | Other " +
        "type Query { item(count: Int): Item, choice: Choice }"
    );
    for (const [name, body] of Object.entries(documents)) {
      mkdirSync(path.dirname(path.join(directory, name)), { recursive: true });
      writeFileSync(path.join(directory, name), body);
    }
    return spawnSync(
      process.execPath,
      [path.join(__dirname, "lint-graphql.js"), root],
      { encoding: "utf8", env: { PATH: process.env.PATH }, timeout: 10000 }
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("validates shared fragments, actual identifier aliases, and inline inheritance", () => {
  const result = check({
    "query.graphql":
      "query Named { item { identifier: id nodeId ...Details ... on Item { name } } }",
    "details.graphql": "fragment Details on Item { id nodeId name }",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated 2 GraphQL documents/);
});

test("reports standard GraphQL errors with a source location", () => {
  const cases = [
    [
      "query Named { item { id nodeId missing } }",
      /Cannot query field "missing"/,
    ],
    [
      "query Named { item { id nodeId name @unknown } }",
      /Unknown directive "@unknown"/,
    ],
    [
      'query Named { item(count: "wrong") { id nodeId } }',
      /Int cannot represent/,
    ],
    [
      "query Named { item { id nodeId ...Missing } }",
      /Unknown fragment "Missing"/,
    ],
    ["query Broken {", /Syntax Error/],
    [
      "query Named($unused: Int) { item { id nodeId } }",
      /Variable "\$unused" is never used/,
    ],
  ];
  for (const [document, expected] of cases) {
    const result = check({ "query.graphql": document });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, expected);
    assert.match(result.stderr, /query\.graphql:1:\d+:/);
  }
});

test("validates documents outside the graphql directory that code generation consumes", () => {
  const result = check({
    "query.graphql": "query Named { item { id nodeId } }",
    "../pages/unsafe.graphql": "{ item { name } }",
  });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /pages\/unsafe\.graphql:1:/);
  assert.match(result.stderr, /All operations must be named/);
  assert.match(result.stderr, /'id' field required/);
});

test("requires names and both actual identifier fields in selections and fragments", () => {
  const cases = [
    ["{ item { id nodeId } }", /All operations must be named/],
    ["query Named { item { nodeId name } }", /'id' field required/],
    ["query Named { item { id name } }", /'nodeId' field required/],
    ["query Named { item { id: name nodeId } }", /'id' field required/],
    [
      "query Named { item { id nodeId ...Details } } fragment Details on Item { name }",
      /'nodeId' field required/,
    ],
    ["query Named { choice { ... on Item { name } } }", /'id' field required/],
  ];
  for (const [document, expected] of cases) {
    const result = check({ "query.graphql": document });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, expected);
  }
});
