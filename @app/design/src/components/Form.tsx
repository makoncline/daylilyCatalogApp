import React from "react";
import styled from "styled-components";

import { Space } from "./Space";

export type FormContextProps = {
  values: { [key: string]: string };
  setValues: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string;
    }>
  >;
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
  onValuesChange,
  children,
  defaultValues = {},
  validation = {},
}: {
  onChange?: (context: OnChangeCallbackProps) => void;
  onSubmit: (context: FormContextProps) => void;
  onValuesChange?: ({
    values,
    setValues,
  }: Pick<FormContextProps, "values" | "setValues">) => void;
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
    const { name, value } = event.target;
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    const newErrors = validation[name]
      ? { ...errors, [name]: validation[name](value) }
      : errors;
    setErrors(newErrors);
    onChange?.({
      ...contextValue,
      values: newValues,
      errors: newErrors,
      changedField: name,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log(values, errors);
    event.preventDefault();
    const allFieldsValid = validateFields();
    if (allFieldsValid) {
      onSubmit(contextValue);
    }
  };

  const validateFields = () => {
    let newErrors = {};
    Object.entries(values).forEach(([name, value]) => {
      if (validation[name]) {
        newErrors[name] = validation[name](value);
      }
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === null);
  };

  const register = React.useCallback((fieldId: string) => {
    setValues((prevValues) => ({ ...prevValues, [fieldId]: "" }));
  }, []);

  const hasError = Object.values(errors).some((error) => error !== null);

  const contextValue: FormContextProps = {
    values,
    setValues,
    errors,
    handleChange,
    setErrors,
    register,
    hasError,
  };

  // used to pass state and set state back to parent
  // probably a bad idea, and should just lift state up instead
  // or put the state in a global form context
  React.useEffect(() => {
    if (typeof onValuesChange === "function") {
      onValuesChange({ values, setValues });
    }
  }, [onValuesChange, values, setValues]);

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit}>
        <Space direction="column" gap="large">
          {children}
        </Space>
      </form>
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
  ...props
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
        {...props}
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
  const el = React.cloneElement(child, {
    type: "submit",
    disabled: hasError,
  });
  return el;
}

const FormError = styled.div`
  color: var(--danger);
  margin: 0;
`;
const Success = styled.div`
  color: var(--success);
  margin: 0;
`;

export { Field, Form, FormError, FormGroup, SubmitButton, Success };
