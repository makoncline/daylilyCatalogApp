import { FormError, Success } from "@app/design";
import React from "react";

export interface PasswordStrengthProps {
  passwordStrength: number;
  suggestions: string[];
}

export function PasswordStrength({
  passwordStrength,
  suggestions = [
    "Use a few words, avoid common phrases",
    "No need for symbols, digits, or uppercase letters",
  ],
}: PasswordStrengthProps) {
  const strongPassword = !(passwordStrength < 4);
  let items = suggestions.map((suggestion, key) => {
    return (
      <li key={key}>
        <FormError>{suggestion}</FormError>
      </li>
    );
  });

  const content = (
    <ul>
      {items}
      {strongPassword ? (
        <li>
          <Success>This is a strong password!</Success>
        </li>
      ) : null}
    </ul>
  );

  return items.length > 0 || strongPassword ? content : null;
}
