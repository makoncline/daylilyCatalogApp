export const truncate = (input: string, length: number = 100) =>
  input && input.length > length
    ? `${input.substring(0, length - 3)}...`
    : input;

export * from "./apiHelpers";
export * from "./getStripe";
export * from "./tableHelpers";
