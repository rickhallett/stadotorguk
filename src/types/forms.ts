/**
 * TypeScript interfaces for form-related types
 * Supporting React integration for Swanage Traffic Alliance
 */

export interface SignUpFormValues {
  name: string;
  email: string;
  postcode: string;
  message: string;
  [key: string]: string;
}

export interface SignUpFormErrors {
  [key: string]: string;
}

export interface SignUpFormState {
  values: SignUpFormValues;
  errors: SignUpFormErrors;
  isSubmitting: boolean;
  isSuccess: boolean;
  touched: {
    [K in keyof SignUpFormValues]: boolean;
  };
}

export interface FormValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  customValidator?: (value: string) => string | null;
}

export type FormValidationSchema = {
  [K in keyof SignUpFormValues]: FormValidationRule;
}

export interface UseFormValidationHookReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: string) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  setFieldError: (field: keyof T, error: string) => void;
}

// Character counter specific types
export interface CharacterCounterProps {
  currentLength: number;
  maxLength: number;
  className?: string;
}

// Form submission states
export type FormSubmissionState = 'idle' | 'submitting' | 'success' | 'error';

export interface FormConfirmationProps {
  isVisible: boolean;
  message: string;
  duration?: number;
  onComplete?: () => void;
}