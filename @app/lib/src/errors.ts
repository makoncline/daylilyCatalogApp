import { ApolloError } from "@apollo/client";
import { GraphQLError, GraphQLFormattedError } from "graphql";

type ErrorInput = Error | ApolloError | GraphQLError | GraphQLFormattedError;
type ErrorResult = Error | GraphQLFormattedError;

export function extractError(error: null): null;
export function extractError(error: ErrorInput): ErrorResult;
export function extractError(error: ErrorInput | null): ErrorResult | null;
export function extractError(error: ErrorInput | null): ErrorResult | null {
  return error && "graphQLErrors" in error
    ? error.graphQLErrors[0] || error
    : error;
}

function errorObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

export function getExceptionFromError(
  error: unknown
): Record<string, unknown> | null {
  const original = errorObject(error);
  const errors = original?.graphQLErrors;
  const extracted =
    Array.isArray(errors) && errors.length ? errorObject(errors[0]) : original;
  return (
    errorObject(errorObject(extracted?.extensions)?.exception) || extracted
  );
}

export function getCodeFromError(error: unknown): string | null {
  const code = getExceptionFromError(error)?.code;
  return typeof code === "string" ? code : null;
}
