const currency = (input: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(input);

function lengthToNumber(length: string) {
  // input "6.5 in (38.0 cm)" -> output "6.5"
  const value = parseInt(
    (length || "").replace(/(^\d+(\.\d+)?)(.+$)/i, "$1"),
    10
  );
  return !isNaN(value) ? value : 0;
}

export { currency, lengthToNumber };
