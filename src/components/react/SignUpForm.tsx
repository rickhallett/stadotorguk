import React, { useState, useCallback, useEffect } from "react";
import { useFormValidation, ValidationRules, ApiHelpers } from "../../hooks";
import type {
  SignUpFormValues,
  SubmitLeadRequest,
  SubmitLeadResponse,
  BaseComponentProps,
} from "../../types";

export interface SignUpFormProps extends BaseComponentProps {
  apiEndpoint?: string;
  confirmationDuration?: number;
  onSubmitSuccess?: (submissionId: string) => void;
  onSubmitError?: (error: string) => void;
}

const initialValues: SignUpFormValues = {
  name: "",
  email: "",
  postcode: "",
  message: "",
};

const validationSchema = {
  name: ValidationRules.name(),
  email: ValidationRules.email(),
  postcode: ValidationRules.ukPostcode(),
  message: ValidationRules.message(1000),
};

export function SignUpForm({
  apiEndpoint = "/api/submit-lead",
  confirmationDuration = 5000,
  onSubmitSuccess,
  onSubmitError,
  className = "",
  ...props
}: SignUpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    // Check if the user has already submitted the form
    if (localStorage.getItem("sta_form_submitted") === "true") {
      setHasSubmitted(true);
    }
  }, []);

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldError,
  } = useFormValidation(initialValues, validationSchema);

  // Character counter for message field
  const remainingChars = 1000 - values.message.length;

  // Handle form submission
  const onSubmit = useCallback(
    async (formValues: SignUpFormValues) => {
      setIsSubmitting(true);
      setSubmissionError(null);

      try {
        // Transform form data to API format
        const nameParts = formValues.name.trim().split(" ");
        const requestData: SubmitLeadRequest = {
          first_name: nameParts[0],
          last_name: nameParts.slice(1).join(" ") || "",
          email: formValues.email.trim(),
          postcode: formValues.postcode.trim().toUpperCase(),
          comments: formValues.message.trim(),
        };

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const result: SubmitLeadResponse = await response.json();

        if (response.ok && result.success) {
          // Success: show confirmation
          setShowConfirmation(true);
          resetForm();

          // Store submission state
          localStorage.setItem("sta_form_submitted", "true");
          setHasSubmitted(true);

          if (onSubmitSuccess && result.submission_id) {
            onSubmitSuccess(result.submission_id);
          }

          // Hide confirmation after specified duration
          setTimeout(() => {
            setShowConfirmation(false);
          }, confirmationDuration);
        } else {
          // Handle non-OK responses
          if (response.status === 409) {
            // Specific error for duplicate email
            setSubmissionError(
              result.error || "This email address has already been registered."
            );
            setFieldError(
              "email",
              "This email address has already been registered."
            );
          } else {
            // General API error
            const errorMessage =
              result.error || "Submission failed. Please try again.";
            setSubmissionError(errorMessage);

            if (onSubmitError) {
              onSubmitError(errorMessage);
            }

            // Handle other field-specific errors if provided
            if (result.error?.includes("postcode")) {
              setFieldError("postcode", "Please check your postcode");
            }
          }
        }
      } catch (error) {
        // Network or other errors
        const errorMessage =
          "There was an error submitting your information. Please try again later.";
        setSubmissionError(errorMessage);

        if (onSubmitError) {
          onSubmitError(errorMessage);
        }

        console.error("SignUpForm submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      apiEndpoint,
      confirmationDuration,
      onSubmitSuccess,
      onSubmitError,
      resetForm,
      setFieldError,
    ]
  );

  // Handle input changes
  const handleInputChange = useCallback(
    (field: keyof SignUpFormValues) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        handleChange(field, value);
      },
    [handleChange]
  );

  // Handle input blur for validation
  const handleInputBlur = useCallback(
    (field: keyof SignUpFormValues) => () => handleBlur(field),
    [handleBlur]
  );

  // Clear submission error when user starts typing
  useEffect(() => {
    if (submissionError && (values.name || values.email || values.postcode)) {
      setSubmissionError(null);
    }
  }, [values.name, values.email, values.postcode, submissionError]);

  if (hasSubmitted) {
    return (
      <div className="form-confirmation" role="alert" aria-live="polite">
        CONFIRMED: YOU ARE NOW PART OF THE ALLIANCE
      </div>
    );
  }

  return (
    <div className={`signup-form-container ${className}`} {...props}>
      <div className="action-form">
        {showConfirmation ? (
          <div className="form-confirmation" role="alert" aria-live="polite">
            CONFIRMED: YOU ARE NOW PART OF THE ALLIANCE
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Global form error */}
            {submissionError && (
              <div
                className="error-message global-error show"
                role="alert"
                aria-live="polite"
              >
                {submissionError}
              </div>
            )}

            {/* Name field */}
            <div className="form-group">
              <label htmlFor="signup-name">NAME *</label>
              <input
                type="text"
                id="signup-name"
                name="name"
                autoComplete="name"
                inputMode="text"
                spellCheck={false}
                value={values.name}
                onChange={handleInputChange("name")}
                onBlur={handleInputBlur("name")}
                required
                maxLength={100}
                className={errors.name && touched.name ? "error" : ""}
                aria-describedby={
                  errors.name && touched.name ? "name-error" : undefined
                }
                disabled={isSubmitting}
              />
              {errors.name && touched.name && (
                <span
                  id="name-error"
                  className="error-message show"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.name}
                </span>
              )}
            </div>

            {/* Email field */}
            <div className="form-group">
              <label htmlFor="signup-email">EMAIL *</label>
              <input
                type="email"
                id="signup-email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={values.email}
                onChange={handleInputChange("email")}
                onBlur={handleInputBlur("email")}
                required
                maxLength={255}
                className={errors.email && touched.email ? "error" : ""}
                aria-describedby={
                  errors.email && touched.email ? "email-error" : undefined
                }
                disabled={isSubmitting}
              />
              {errors.email && touched.email && (
                <span
                  id="email-error"
                  className="error-message show"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.email}
                </span>
              )}
            </div>

            {/* Postcode field */}
            <div className="form-group">
              <label htmlFor="signup-postcode">UK POSTCODE *</label>
              <input
                type="text"
                id="signup-postcode"
                name="postcode"
                autoComplete="postal-code"
                inputMode="text"
                spellCheck={false}
                value={values.postcode}
                onChange={handleInputChange("postcode")}
                onBlur={handleInputBlur("postcode")}
                required
                maxLength={8}
                className={errors.postcode && touched.postcode ? "error" : ""}
                aria-describedby={
                  errors.postcode && touched.postcode
                    ? "postcode-error"
                    : undefined
                }
                disabled={isSubmitting}
                style={{ textTransform: "uppercase" }}
              />
              {errors.postcode && touched.postcode && (
                <span
                  id="postcode-error"
                  className="error-message show"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.postcode}
                </span>
              )}
            </div>

            {/* Message field with character counter */}
            <div className="form-group">
              <label htmlFor="signup-message">
                YOUR MESSAGE TO THE ALLIANCE
              </label>
              <textarea
                id="signup-message"
                name="message"
                autoComplete="off"
                inputMode="text"
                value={values.message}
                onChange={handleInputChange("message")}
                onBlur={handleInputBlur("message")}
                rows={4}
                maxLength={1000}
                className={errors.message && touched.message ? "error" : ""}
                aria-describedby="character-count"
                disabled={isSubmitting}
                placeholder="Share your experience with traffic issues in Swanage..."
              />

              {/* Character counter */}
              <div
                id="character-count"
                className={`character-counter ${
                  remainingChars < 50 ? "warning" : ""
                }`}
                aria-live="polite"
              >
                {remainingChars} characters remaining
              </div>

              {errors.message && touched.message && (
                <span
                  id="message-error"
                  className="error-message show"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.message}
                </span>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`submit-btn ${isSubmitting ? "loading" : ""} ${
                !isValid ? "disabled" : ""
              }`}
              aria-describedby="submit-status"
            >
              {isSubmitting ? "PROCESSING..." : "STAND WITH US"}
            </button>

            {/* Screen reader status */}
            <div
              id="submit-status"
              className="sr-only"
              aria-live="polite"
              aria-atomic="true"
            >
              {isSubmitting ? "Submitting form..." : ""}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
