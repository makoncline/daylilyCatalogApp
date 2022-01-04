import { FormError, Success } from "@app/design";
import React from "react";

export interface PasswordStrengthProps {
  passwordStrength: number;
  suggestions: string[];
  isDirty: boolean;
  isFocussed: boolean;
}

export function PasswordStrength({
  passwordStrength,
  suggestions = [
    "Use a few words, avoid common phrases",
    "No need for symbols, digits, or uppercase letters",
  ],
}: PasswordStrengthProps) {
  const strongPassword = !(passwordStrength < 4);
  const content = (
    <ul>
      {suggestions.map((suggestion, key) => {
        return (
          <li key={key}>
            <FormError>{suggestion}</FormError>
          </li>
        );
      })}
      {strongPassword ? (
        <li>
          <Success>This is a strong password!</Success>
        </li>
      ) : null}
    </ul>
  );

  return content;
}
