import { Store } from "rc-field-form/lib/interface";
import zxcvbn from "zxcvbn";

interface ExpectedProps {
  setPasswordStrength: (score: number) => void;
  setPasswordSuggestions: (message: string[]) => void;
}

export const setPasswordInfo = (
  props: ExpectedProps,
  changedValues: Store,
  fieldName = "password"
): void => {
  // On field change check to see if password changed
  if (!(fieldName in changedValues)) {
    return;
  }

  const value = changedValues[fieldName];
  const { score, feedback } = zxcvbn(value || "");
  props.setPasswordStrength(score);

  const messages = [...feedback.suggestions];
  if (feedback.warning !== "") {
    messages.push(feedback.warning);
  }
  props.setPasswordSuggestions(messages);
};

export const getPasswordStrength = (value: string): number => {
  const { score } = zxcvbn(value);
  return score;
};

export const getPasswordSuggestions = (value: string): string[] => {
  const { feedback } = zxcvbn(value);
  const messages = [...feedback.suggestions];
  if (feedback.warning !== "") {
    messages.push(feedback.warning);
  }
  return messages;
};
