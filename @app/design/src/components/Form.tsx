import React from "react";
import styled from "styled-components";

import { Space } from "./Space";

type FormValues = { [key: string]: string };
type FormIsReady = { [key: string]: boolean };
type GlobalFormContextProps = {
  register: (formId: string) => void;
  unregister: (formId: string) => void;
  isReady: FormIsReady;
  getForm: (formId: string) => {
    isReady: boolean;
    values: FormValues;
    setValues: (values: FormValues) => void;
    setField: (field: string, value: string) => void;
    registerField: (fieldId: string, defaultValue?: string) => void;
    fieldIsReady: (fieldId: string) => boolean;
  };
  getFormIsReady: (formId: string) => boolean;
  getFormValues: (formId: string) => FormValues;
  setFormValues: (formId: string, values: FormValues) => void;
  setFormField: (formId: string, field: string, value: string) => void;
  registerFormField: (
    formId: string,
    fieldId: string,
    defaultValue?: string
  ) => void;
  formFieldIsReady: (formId: string, fieldId: string) => boolean;
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

const FormValuesProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = React.useState<{ [key: string]: FormValues }>({});
  const [isReady, setIsReady] = React.useState<FormIsReady>({});

  React.useEffect(() => {
    console.log("data: ", data);
  }, [data]);
  React.useEffect(() => {
    console.log("isReady: ", isReady);
  }, [isReady]);

  const register = React.useCallback((formId: string) => {
    console.log("registering form: ", formId);
    setData((prevData) => ({ ...prevData, [formId]: {} }));
    setIsReady((prevIsReady) => ({ ...prevIsReady, [formId]: true }));
  }, []);
  const unregister = React.useCallback((formId: string) => {
    console.log("unregistering form: ", formId);
    setIsReady((prevIsReady) => ({ ...prevIsReady, [formId]: false }));
  }, []);

  const getForm = (formId: string) => ({
    isReady: isReady[formId] !== undefined,
    values: data[formId],
    setValues: (values: { [key: string]: string }) =>
      setData((prevData) => ({ ...prevData, [formId]: values })),
    setField: (fieldId: string, value: string) =>
      setData((prevData) => ({
        ...prevData,
        [formId]: { ...prevData[formId], [fieldId]: value },
      })),
    registerField: (fieldId: string, defaultValue: string = "") => {
      console.log("registering field: ", fieldId);
      setData((prevData) => ({
        ...prevData,
        [formId]: { ...prevData[formId], [fieldId]: defaultValue },
      }));
    },
    fieldIsReady: (fieldId: string) => data[formId][fieldId] !== undefined,
  });

  const getFormIsReady = (formId: string) => isReady[formId] === true;

  const getFormValues = (formId: string) => data[formId];
  const setFormValues = React.useCallback(
    (formId: string, values: { [key: string]: string }) =>
      setData((prevData) => ({ ...prevData, [formId]: values })),
    []
  );
  const setFormField = (formId: string, fieldId: string, value: string) =>
    setData((prevData) => ({
      ...prevData,
      [formId]: { ...prevData[formId], [fieldId]: value },
    }));
  const registerFormField = (
    formId: string,
    fieldId: string,
    defaultValue: string = ""
  ) =>
    setData((prevData) => ({
      ...prevData,
      [formId]: { ...prevData[formId], [fieldId]: defaultValue },
    }));

  const formFieldIsReady = (formId: string, fieldId: string) =>
    data[formId][fieldId] !== undefined;
  const value = {
    register,
    unregister,
    isReady,
    getForm,
    getFormIsReady,
    getFormValues,
    setFormValues,
    setFormField,
    registerFormField,
    formFieldIsReady,
  };
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
  registerField: (fieldId: string) => void;
  fieldIsReady: (fieldId: string) => boolean;
  hasError: boolean;
  setErrors: (errors: { [key: string]: string | null }) => void;
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
  const {
    register,
    unregister,
    getFormIsReady,
    getFormValues,
    setFormValues,
    registerFormField,
    formFieldIsReady,
  } = useGlobalForm();
  const values = getFormValues(formId);
  const isReady = getFormIsReady(formId);
  const setValues = (values: FormValues) => setFormValues(formId, values);
  const registerField = (fieldId: string) => registerFormField(formId, fieldId);
  const fieldIsReady = (fieldId: string) => formFieldIsReady(formId, fieldId);
  const [errors, setErrors] = React.useState<{
    [key: string]: string | null;
  }>({});

  React.useEffect(() => {
    if (!isReady) {
      register(formId);
    }
    return () => {
      if (isReady) {
        unregister(formId);
      }
    };
  }, [formId, isReady, register, unregister]);

  if (!values || !errors) {
    return null;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const newValues = { ...values, [name]: value };
    setFormValues(formId, newValues);
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
    registerField,
    fieldIsReady,
    hasError,
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
  const { handleChange, values, errors, registerField, fieldIsReady } =
    useFormState();
  const fieldId = name ? name : camelCase(child);

  React.useEffect(() => {
    if (!fieldIsReady(fieldId)) {
      registerField(fieldId);
    }
  }, [fieldId, fieldIsReady, registerField]);

  const error = errors[fieldId];
  const value = values[fieldId];

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
  FormValues,
  FormValuesProvider,
  SubmitButton,
  Success,
  useGlobalForm,
};
