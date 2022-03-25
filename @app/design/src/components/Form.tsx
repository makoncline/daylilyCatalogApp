import React from "react";
import styled from "styled-components";

import { Space } from "./Space";

type FormValues = { [key: string]: string };
type FormIsReady = { [key: string]: boolean };
type GlobalFormContextProps = {
  register: (formId: string, formData: FormValues) => void;
  isReady: FormIsReady;
  getForm: (formId: string) => {
    values: FormValues;
    setValues: (values: FormValues) => void;
    isReady: boolean;
  };
};

const GlobalFormContext = React.createContext<
  GlobalFormContextProps | undefined
>(undefined);

const useGlobalForm = () => {
  const context = React.useContext(GlobalFormContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalForm must be used within a FormValuesContext provider"
    );
  }
  return context;
};

const useForm = (formId: string) => {
  const { getForm } = useGlobalForm();
  const form = getForm(formId);
  if (!form) {
    throw new Error(`Could not get form state for ${formId}`);
  }
  return form;
};

const FormValuesProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = React.useState<{ [key: string]: FormValues }>({});
  const [isReady, setIsReady] = React.useState<FormIsReady>({});

  React.useEffect(() => {
    console.log("data: ", data);
  }, [data]);

  const register = React.useCallback(
    (formId: string, formData: FormValues) => {
      console.log("registering form: ", formId);
      setData({ ...data, [formId]: formData });
      setIsReady({ ...isReady, [formId]: true });
    },
    [data, isReady]
  );

  const setField = React.useCallback(
    (fieldId: string, value: string, formId: string) => {
      setData((prevData) => ({
        ...prevData,
        [formId]: { ...prevData[formId], [fieldId]: value },
      }));
    },
    []
  );
  const getForm = (formId: string) => ({
    values: data[formId],
    setValues: (values: { [key: string]: string }) => setData((prevData) => ({ ...prevData, [formId]: values }));,
    isReady: isReady[formId],
  });
  const value = { register, isReady, setField, getForm };
  return (
    <GlobalFormContext.Provider value={value}>
      {children}
    </GlobalFormContext.Provider>
  );
};

export type FormStateContextProps = {
  values: { [key: string]: string };
  setValues: (values: { [key: string]: string }) => void;
  errors: { [key: string]: string | null };
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  register: (fieldId: string) => void;
  hasError: boolean;
  setErrors: (errors: { [key: string]: string | null }) => void;
  isFieldReady: { [key: string]: boolean };
};

export type OnChangeCallbackProps = FormStateContextProps & {
  changedField: string;
};

const FormStateContext = React.createContext<FormStateContextProps | undefined>(
  undefined
);

const useFormState = () => {
  const context = React.useContext(FormStateContext);
  if (context === undefined) {
    throw new Error("useForm must be used within a FormContext provider");
  }
  return context;
};

const Form = ({
  formId,
  onChange,
  onSubmit,
  children,
  validation = {},
}: {
  formId: string;
  onChange?: (context: OnChangeCallbackProps) => void;
  onSubmit: (context: FormStateContextProps) => void;
  onValuesChange?: ({
    values,
    setValues,
  }: Pick<FormStateContextProps, "values" | "setValues">) => void;
  children: React.ReactNode;
  validation?: { [key: string]: (...args: any) => string | null };
}) => {
  const { register } = useGlobalForm();
  const { values, setValues, isReady } = useForm(formId);
  const [errors, setErrors] = React.useState<{
    [key: string]: string | null;
  }>({});
  const [isFieldReady, setIsFieldReady] = React.useState<{
    [key: string]: boolean;
  }>({});
  React.useEffect(() => {
    if (!isReady) {
      register(formId, values);
    }
  }, [formId, isReady, register, values]);

  const registerField = React.useCallback(
    (fieldId: string) => {
      console.log("registering field: ", fieldId);
      setValues({ ...values, [fieldId]: "" });
      setIsFieldReady((prevIsFieldReady) => ({
        ...prevIsFieldReady,
        [fieldId]: true,
      }));
    },
    [setValues, values]
  );

  if (!values || !errors) {
    return null;
  }

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

  const hasError = Object.values(errors).some((error) => error !== null);

  const contextValue: FormStateContextProps = {
    values,
    setValues,
    errors,
    handleChange,
    setErrors,
    register: registerField,
    hasError,
    isFieldReady,
  };

  return (
    <FormStateContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit}>
        <Space direction="column" gap="large">
          {children}
        </Space>
      </form>
    </FormStateContext.Provider>
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

type FieldProps = {
  name?: string;
  type?: "text" | "password" | "email" | "number";
  required?: boolean;
  label?: boolean;
  placeholder?: string;
  children: string;
  direction?: "column" | "row";
  autoComplete?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

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
}: FieldProps) => {
  const { handleChange, values, errors, register, isFieldReady } =
    useFormState();
  const fieldId = name ? name : camelCase(child);
  const error = errors[fieldId];
  const value = values[fieldId];

  React.useEffect(() => {
    if (!isFieldReady[fieldId]) {
      register(fieldId);
    }
  }, [fieldId, isFieldReady, register]);

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
  const { hasError } = useFormState();
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

export {
  Field,
  Form,
  FormError,
  FormGroup,
  FormValuesProvider,
  SubmitButton,
  Success,
  useForm,
};
