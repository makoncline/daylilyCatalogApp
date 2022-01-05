import React from "react";
import styled from "styled-components";

import { Space } from "./Space";

export type FormContextProps = {
  values: { [key: string]: string };
  errors: { [key: string]: string | null };
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  register: (fieldId: string) => void;
  hasError: boolean;
  setErrors: (errors: { [key: string]: string | null }) => void;
};

export type OnChangeCallbackProps = FormContextProps & { changedField: string };

const FormContext = React.createContext<FormContextProps | undefined>(
  undefined
);

const useForm = () => {
  const context = React.useContext(FormContext);
  if (context === undefined) {
    throw new Error("useForm must be used within a FormContext provider");
  }
  return context;
};

const Form = ({
  onChange,
  onSubmit,
  children,
  defaultValues = {},
  validation = {},
}: {
  onChange?: (context: OnChangeCallbackProps) => void;
  onSubmit: (context: FormContextProps) => void;
  children: React.ReactNode;
  defaultValues?: { [key: string]: string };
  validation?: { [key: string]: (...args: any) => string | null };
}) => {
  const [values, setValues] =
    React.useState<{ [key: string]: string }>(defaultValues);
  const [errors, setErrors] = React.useState<{
    [key: string]: string | null;
  }>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value: fieldValue } = event.target;
    const newValues = { ...values, [name]: fieldValue };
    const newErrors = validation[name]
      ? { ...errors, [name]: validation[name](fieldValue) }
      : errors;
    setValues(newValues);
    setErrors(newErrors);
    onChange?.({
      ...value,
      values: newValues,
      errors: newErrors,
      changedField: name,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(value);
  };

  const register = React.useCallback((fieldId: string) => {
    setValues((prevValues) => ({ ...prevValues, [fieldId]: "" }));
  }, []);

  const hasError = Object.values(errors).some((error) => error !== null);

  const value: FormContextProps = {
    values,
    errors,
    handleChange,
    setErrors,
    register,
    hasError,
  };

  return (
    <FormContext.Provider value={value}>
      <Wrapper onSubmit={handleSubmit}>
        <Space direction="column" gap="large">
          {children}
        </Space>
      </Wrapper>
    </FormContext.Provider>
  );
};

type FormGroupProps = {
  direction?: "row" | "column";
};

const FormGroup = styled.div`
  display: flex;
  flex-direction: ${(props: FormGroupProps) =>
    props.direction === "row" ? "row" : "column"};
  align-items: ${(props: FormGroupProps) =>
    props.direction === "row" ? "center" : "stretch"};
  gap: var(--size-2);
`;

const camelCase = (str: string) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return "";
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
};

const Field = ({
  name = "",
  type = "text",
  required = false,
  label = true,
  placeholder = "",
  children: child,
  direction = "column",
  autoComplete,
}: {
  name?: string;
  type?: "text" | "password" | "email" | "number";
  required?: boolean;
  label?: boolean;
  placeholder?: string;
  children: string;
  direction?: "column" | "row";
  autoComplete?: string;
}) => {
  const { handleChange, values, errors, register } = useForm();
  const fieldId = name ? name : camelCase(child);
  const error = errors[fieldId];
  const value = values[fieldId];

  React.useEffect(() => {
    register(fieldId);
  }, [register, fieldId]);

  return (
    <FormGroup direction={direction}>
      <label htmlFor={fieldId} hidden={!label}>
        {required ? "*" : null}
        {child}
      </label>
      <input
        id={fieldId}
        name={fieldId}
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={handleChange}
        autoComplete={autoComplete}
      />
      {error ? <FormError>{error}</FormError> : null}
    </FormGroup>
  );
};

function SubmitButton({
  children: child,
}: {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}) {
  const { hasError } = useForm();
  return React.cloneElement(child, {
    htmlType: "submit",
    disabled: hasError,
  });
}

const Label = styled.label``;
const Input = styled.input``;

const FormError = styled.div`
  color: var(--danger);
  margin: 0;
`;
const Success = styled.div`
  color: var(--success);
  margin: 0;
`;

const Wrapper = styled.form``;

export {
  Field,
  Form,
  FormError,
  FormGroup,
  Input,
  Label,
  SubmitButton,
  Success,
};
