const { readdirSync, readFileSync } = require("node:fs");
const path = require("node:path");
const {
  buildSchema,
  concatAST,
  GraphQLError,
  isInterfaceType,
  isObjectType,
  Kind,
  NoUnusedFragmentsRule,
  parse,
  Source,
  specifiedRules,
  validate,
} = require("graphql");

function namedOperations(context) {
  return {
    OperationDefinition(node) {
      if (!node.name) {
        context.reportError(
          new GraphQLError("All operations must be named", [node])
        );
      }
    },
  };
}

function hasField(selectionSet, field) {
  return selectionSet.selections.some(
    (selection) =>
      selection.kind === Kind.FIELD && selection.name.value === field
  );
}

function requiredIdentifiers(context) {
  return {
    SelectionSet(node, _key, parent, _path, ancestors) {
      if (parent.kind === Kind.OPERATION_DEFINITION) return;
      const type = context.getParentType();
      if (!isObjectType(type) && !isInterfaceType(type)) return;

      for (const field of ["nodeId", "id"]) {
        if (!type.getFields()[field]) continue;
        let selected = hasField(node, field);
        if (!selected && parent.kind === Kind.INLINE_FRAGMENT) {
          for (const ancestor of [...ancestors].reverse()) {
            if (
              ancestor.selectionSet &&
              hasField(ancestor.selectionSet, field)
            ) {
              selected = true;
              break;
            }
            if (
              [
                Kind.FIELD,
                Kind.FRAGMENT_DEFINITION,
                Kind.OPERATION_DEFINITION,
              ].includes(ancestor.kind)
            )
              break;
          }
        }
        if (!selected) {
          context.reportError(
            new GraphQLError(
              "'" + field + "' field required on '" + type.name + "'",
              [parent]
            )
          );
        }
      }
    },
  };
}

function documentFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return documentFiles(filename);
    return entry.isFile() && entry.name.endsWith(".graphql") ? [filename] : [];
  });
}

function lintGraphql(root) {
  const schema = buildSchema(
    readFileSync(path.join(root, "data/schema.graphql"), "utf8")
  );
  const files = documentFiles(path.join(root, "@app/client/src")).sort();
  if (!files.length) throw new Error("No client GraphQL documents found");
  const documents = [];
  const errors = [];
  for (const filename of files) {
    try {
      documents.push(
        parse(
          new Source(
            readFileSync(filename, "utf8"),
            path.relative(root, filename)
          )
        )
      );
    } catch (error) {
      if (!(error instanceof GraphQLError)) throw error;
      errors.push(error);
    }
  }
  const rules = specifiedRules.filter((rule) => rule !== NoUnusedFragmentsRule);
  errors.push(
    ...validate(schema, concatAST(documents), [
      ...rules,
      namedOperations,
      requiredIdentifiers,
    ])
  );
  return { files, errors };
}

if (require.main === module) {
  const root = path.resolve(process.argv[2] || path.join(__dirname, ".."));
  const { files, errors } = lintGraphql(root);
  for (const error of errors) {
    const source =
      error.nodes?.[0]?.loc?.source.name || error.source?.name || "GraphQL";
    const location = error.locations?.[0];
    console.error(
      source +
        (location ? ":" + location.line + ":" + location.column : "") +
        ": " +
        error.message
    );
  }
  if (errors.length) process.exitCode = 1;
  else console.log("Validated " + files.length + " GraphQL documents.");
}
