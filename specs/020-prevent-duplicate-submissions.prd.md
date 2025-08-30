# PRD 020: Prevent Duplicate Form Submissions

- **Version:** 1.0
- **Date:** 2025-08-30

## 1. Executive Summary

This document outlines the requirements for preventing duplicate submissions of the sign-up form. This will be achieved through a combination of client-side checks using local storage and server-side validation to ensure email uniqueness in the database.

## 2. Problem Statement

The current sign-up form allows users to submit their information multiple times from the same device. Additionally, the API does not check for the uniqueness of email addresses before creating a new record. This can lead to duplicate entries in the database, which inflates the member count and can cause issues with data integrity.

## 3. Requirements

### User Requirements

- A user who has already submitted the form should not be able to see or submit the form again from the same browser.
- If a user tries to submit the form with an email address that already exists, they should be shown a clear error message.

### Technical Requirements

#### Client-Side (React `SignUpForm`)

- Upon successful form submission, a flag should be stored in the browser's `localStorage` to indicate that the user has already signed up.
- When the `SignUpForm` component mounts, it should check for the presence of this flag in `localStorage`.
- If the flag is present, the form should be hidden, and a confirmation message (e.g., "Thank you for signing up!") should be displayed instead.

#### Server-Side (API `/api/submit-lead`)

- The API endpoint must validate that the incoming email address does not already exist in the `leads` table before creating a new record.
- If the email address already exists, the API should respond with a `409 Conflict` status code and a JSON object containing an appropriate error message (e.g., `{ "error": "This email address has already been registered." }`).

#### Database (`src/utils/database.ts`)

- A new function, `getLeadByEmail(email: string)`, must be created to query the `leads` table for a record matching the given email address.

## 4. Implementation Notes

### Database (`src/utils/database.ts`)

A new function should be added to check for the existence of an email.

```typescript
// src/utils/database.ts

// ... existing code

export async function getLeadByEmail(email: string): Promise<Lead | null> {
  try {
    const sql = getSql();
    const result = await sql<Lead[]>`
      SELECT * FROM leads 
      WHERE email = ${email}
      LIMIT 1
    `;
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to get lead by email:", error);
    throw error;
  }
}

// ... existing code
```

### API (`src/pages/api/submit-lead.ts`)

The `POST` handler should be updated to use the new `getLeadByEmail` function.

```typescript
// src/pages/api/submit-lead.ts

// ... imports
import { createLead, getLeadByEmail, type LeadData } from "../../utils/database.js";

// ...

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // ... existing validation

    // Check for existing email
    const existingLead = await getLeadByEmail(data.email);
    if (existingLead) {
      return new Response(
        JSON.stringify({ error: 'This email address has already been registered.' }),
        {
          status: 409, // Conflict
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // ... rest of the function
  } catch (error) {
    // ...
  }
};
```

### React Form (`src/components/react/SignUpForm.tsx`)

The form should use `localStorage` to manage the submission state.

```typescript
// src/components/react/SignUpForm.tsx

// ... imports
import React, { useState, useCallback, useEffect } from 'react';

// ...

export function SignUpForm({
  // ... props
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    // Check if the user has already submitted the form
    if (localStorage.getItem('sta_form_submitted') === 'true') {
      setHasSubmitted(true);
    }
  }, []);

  const onSubmit = useCallback(async (formValues: SignUpFormValues) => {
    // ...
    try {
      // ... fetch call
      const result: SubmitLeadResponse = await response.json();

      if (response.ok && result.success) {
        // ...
        localStorage.setItem('sta_form_submitted', 'true');
        setHasSubmitted(true);
      } else {
        // ...
      }
    } catch (error) {
      // ...
    }
  }, [/* ... dependencies */]);

  if (hasSubmitted) {
    return (
      <div className="form-confirmation" role="alert" aria-live="polite">
        CONFIRMED: YOU ARE NOW PART OF THE ALLIANCE
      </div>
    );
  }

  return (
    // ... the rest of the form JSX
  );
}
```

## 5. Success Metrics

- A significant reduction in duplicate lead entries in the database.
- The form UI correctly reflects the submitted state on subsequent visits from the same browser.
- The API correctly rejects submissions with duplicate email addresses.
