import React, { useState, useCallback, useRef } from 'react';
import type { 
  UseFormValidationHookReturn, 
  FormValidationRule, 
  FormValidationSchema 
} from '../types';

/**
 * Custom hook for form validation with TypeScript support
 * Handles form state, validation, and submission logic
 */
export function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  validationSchema: Record<keyof T, FormValidationRule>
): UseFormValidationHookReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reference to track if component is mounted
  const isMountedRef = useRef(true);

  // Validate a single field
  const validateField = useCallback((field: keyof T, value: string): string => {
    const rule = validationSchema[field];
    if (!rule) return '';

    // Required validation
    if (rule.required && (!value || value.trim() === '')) {
      return `${String(field).toUpperCase()} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value.trim() && !rule.required) {
      return '';
    }

    // Pattern validation (regex)
    if (rule.pattern && !rule.pattern.test(value)) {
      if (field === 'email') {
        return 'Please enter a valid email address';
      }
      if (field === 'postcode') {
        return 'Please enter a valid UK postcode';
      }
      if (field === 'name') {
        return 'Please enter a valid name (letters and spaces only)';
      }
      return `${String(field).toUpperCase()} format is invalid`;
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return `${String(field).toUpperCase()} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${String(field).toUpperCase()} must be no more than ${rule.maxLength} characters`;
    }

    // Custom validation
    if (rule.customValidator) {
      const customError = rule.customValidator(value);
      if (customError) return customError;
    }

    return '';
  }, [validationSchema]);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;
    let isValid = true;

    Object.keys(values).forEach((field) => {
      const error = validateField(field as keyof T, values[field as keyof T]);
      if (error) {
        newErrors[field as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationSchema]);

  // Handle field change
  const handleChange = useCallback((field: keyof T, value: string) => {
    if (!isMountedRef.current) return;

    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field if it was previously invalid
    if (errors[field]) {
      const fieldError = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    }
  }, [errors, validationSchema]);

  // Handle field blur (for touched state and validation)
  const handleBlur = useCallback((field: keyof T) => {
    if (!isMountedRef.current) return;

    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur
    const fieldError = validateField(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  }, [values, validationSchema]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit: (values: T) => Promise<void>) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!isMountedRef.current) return;

      // Mark all fields as touched
      const touchedFields = {} as Record<keyof T, boolean>;
      Object.keys(values).forEach((field) => {
        touchedFields[field as keyof T] = true;
      });
      setTouched(touchedFields);

      // Validate form
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
        // Error handling is delegated to the component
      } finally {
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    };
  }, [values, validateForm]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    if (!isMountedRef.current) return;

    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  // Set field error manually (useful for server-side validation errors)
  const setFieldError = useCallback((field: keyof T, error: string) => {
    if (!isMountedRef.current) return;

    setErrors(prev => ({ ...prev, [field]: error }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // Check if form is valid (no errors)
  const isValid = Object.values(errors).every(error => error === '');

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldError
  };
}

// Validation rule builders for common patterns
export const ValidationRules = {
  required: (): FormValidationRule => ({ required: true }),
  
  email: (): FormValidationRule => ({
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  }),
  
  ukPostcode: (): FormValidationRule => ({
    required: true,
    pattern: /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i,
  }),
  
  name: (): FormValidationRule => ({
    required: true,
    pattern: /^[A-Za-z\s]+$/,
    minLength: 2,
    maxLength: 100,
  }),
  
  message: (maxLength = 1000): FormValidationRule => ({
    required: false,
    maxLength,
  }),
  
  minLength: (min: number): FormValidationRule => ({ minLength: min }),
  maxLength: (max: number): FormValidationRule => ({ maxLength: max }),
  
  custom: (validator: (value: string) => string | null): FormValidationRule => ({
    customValidator: validator,
  }),
};