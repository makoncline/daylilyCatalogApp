import React from "react";
import styled from "styled-components";

import { Space } from "./Space";

type FormContextType =
  | {
      values: { [key: string]: string };
      errors: { [key: string]: string | null };
      handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
      register: (fieldId: string) => void;
      hasError: boolean;
    }
  | undefined;

const FormContext = React.createContext<FormContextType>(undefined);

const useForm = () => {
  const context = React.useContext(FormContext);
  if (context === undefined) {
    throw new Error("useForm must be used within a FormContext provider");
  }
  return context;
};

const Form = ({
  onSubmit,
  children,
  defaultValues = {},
  validation = {},
}: {
  onSubmit: (event: any) => Promise<void>;
  children: React.ReactNode;
  defaultValues?: { [key: string]: string };
  validation?: { [key: string]: (value: string) => string | null };
}) => {
  const [values, setValues] =
    React.useState<{ [key: string]: any }>(defaultValues);
  const [errors, setErrors] = React.useState<{
    [key: string]: string | null;
  }>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({ ...prevValues, [name]: event.target.value }));
    setErrors((prevErrors) =>
      validation[name]
        ? { ...prevErrors, [name]: validation[name](value) }
        : prevErrors
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(value);
  };

  const register = React.useCallback((fieldId: string) => {
    setValues((prevValues) => ({ ...prevValues, [fieldId]: "" }));
  }, []);

  const hasError = Object.values(errors).some((error) => error !== null);

  const value = {
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

const FormError = styled.pre`
  color: var(--danger);
  margin: 0;
`;
const Success = styled.pre`
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
