# Product Requirements Document: Sign-up Form to Decap CMS Integration

**Document Version:** 1.0  
**Date:** 2025-08-27  
**Feature Name:** Sign-up Form to Decap CMS Leads Collection Integration  
**PRD Number:** 008

## Executive Summary

This PRD outlines the integration of the existing commented-out sign-up form on the homepage with the Decap CMS leads collection system. Since Decap CMS does not support public form submissions without authentication (it's designed for authenticated admin panel use only), we need to implement a custom API endpoint using Netlify Functions or similar serverless solution. This will enable automatic creation of lead entries via the GitHub API when users submit the sign-up form, providing a seamless way to capture and manage supporter information for the Swanage Traffic Alliance campaign.

## Problem Statement

### Current Issues
1. **Disconnected Form**: The sign-up form exists as commented-out code in `index.astro` but is not functional
2. **Manual Lead Management**: No automated system to capture and store supporter information
3. **No CMS Integration**: Form submissions don't integrate with the existing Decap CMS leads collection
4. **Missing Analytics**: No way to track sign-up conversions or supporter growth
5. **Data Silos**: Supporter data not connected to the movement counter or other site features

### User Pain Points
- Supporters cannot easily join the alliance through the website
- Campaign organizers lack a streamlined way to collect and manage supporter information
- No automated process for capturing leads from website visitors
- Missing GDPR-compliant data collection mechanism

## Requirements

### Functional Requirements

#### Form Field Mapping
```yaml
Form Fields → CMS Fields:
  name → first_name + last_name (split on space)
  email → email
  postcode → (used for visitor_type determination)
  message → comments
  (generated) → user_id
  (generated) → submission_id
  (generated) → timestamp
  (determined) → visitor_type (based on postcode)
  (static) → source: "signup_form"
  (default) → published: true
```

#### Postcode-based Visitor Type Logic
```javascript
function determineVisitorType(postcode) {
  const localPostcodes = ['BH19', 'BH20', 'DT11']; // Swanage area codes
  const prefix = postcode.toUpperCase().substring(0, 4);
  
  if (localPostcodes.includes(prefix)) {
    return 'Local';
  } else if (postcode.startsWith('BH') || postcode.startsWith('DT')) {
    return 'Visitor'; // Wider Dorset area
  } else {
    return 'Other';
  }
}
```

### Technical Requirements

#### API Endpoint Structure
```javascript
// /api/submit-lead.js (Netlify Function)
exports.handler = async (event, context) => {
  // 1. Validate request method (POST only)
  // 2. Parse and validate form data
  // 3. Check for duplicate email
  // 4. Generate unique IDs
  // 5. Create markdown file content
  // 6. Use GitHub API to create file in repo
  // 7. Return success/error response
};
```

#### Markdown File Format
```markdown
---
timestamp: 2025-03-14 10:30
user_id: usr_1234567890abc
name: John Smith
first_name: John
last_name: Smith
email: john.smith@example.com
visitor_type: Local
comments: "I've lived here for 20 years and the traffic..."
referral_code: ""
source: signup_form
submission_id: sub_abc123def456
published: true
---
```

### Data Validation Requirements

1. **Input Validation** (for data integrity only)
   - Email format validation (basic regex pattern)
   - Postcode format validation (UK postcode pattern)
   - Name length limits (max 100 chars)
   - Message length limits (max 1000 chars)

2. **Environment Variables**
   ```bash
   GITHUB_TOKEN=ghp_xxxxxxxxxxxx
   ```

### Design Requirements

#### Form Styling (Brutalist Design)
```css
.action-form {
  background: var(--brutal-white);
  border: 8px solid var(--brutal-black);
  box-shadow: 15px 15px 0 var(--brutal-shadow);
  padding: 3rem;
  margin: 2rem 0;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  font-family: 'Arial Black', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -2px;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 1rem;
  border: 4px solid var(--brutal-black);
  font-size: 1rem;
  font-family: 'Arial', sans-serif;
  background: var(--brutal-white);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  box-shadow: 8px 8px 0 var(--brutal-shadow);
  transform: translate(-2px, -2px);
}

.submit-btn {
  background: var(--brutal-red);
  color: var(--brutal-white);
  border: 4px solid var(--brutal-black);
  padding: 1.5rem 3rem;
  font-family: 'Arial Black', sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -2px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 8px 8px 0 var(--brutal-black);
}

.submit-btn:hover {
  transform: translate(-4px, -4px);
  box-shadow: 12px 12px 0 var(--brutal-black);
}

.submit-btn:active {
  transform: translate(0, 0);
  box-shadow: 4px 4px 0 var(--brutal-black);
}

.submit-btn:disabled {
  background: var(--brutal-gray);
  cursor: not-allowed;
  opacity: 0.7;
}

.form-confirmation {
  background: var(--brutal-black);
  color: var(--brutal-white);
  border: 4px solid var(--brutal-red);
  padding: 2rem;
  text-align: center;
  font-family: 'Arial Black', sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -2px;
  margin-top: 2rem;
  animation: confirmSlam 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes confirmSlam {
  0% {
    transform: scale(0) rotate(-5deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(2deg);
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

.error-message {
  color: var(--brutal-red);
  font-weight: bold;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.loading-spinner {
  border: 8px solid var(--brutal-gray);
  border-top: 8px solid var(--brutal-red);
  border-radius: 0;
  width: 50px;
  height: 50px;
  animation: brutalSpin 1s linear infinite;
}

@keyframes brutalSpin {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg); }
  100% { transform: rotate(360deg); }
}
```

## Implementation Notes

### Phase 1: Form Activation (Client-side)
```javascript
// Form validation and submission handler
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const confirmation = document.getElementById('formConfirmation');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Split name into first and last
    const nameParts = data.name.trim().split(' ');
    const processedData = {
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' ') || nameParts[0],
      email: data.email,
      postcode: data.postcode,
      comments: data.message || ''
    };
    
    // Show loading state
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'PROCESSING...';
    
    try {
      // Submit to API
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData)
      });
      
      if (response.ok) {
        // Show confirmation
        form.style.display = 'none';
        confirmation.style.display = 'block';
        
        // Increment counter
        updateMovementCounter();
        
        // Clear form
        form.reset();
        
        // Hide confirmation after 5 seconds
        setTimeout(() => {
          confirmation.style.display = 'none';
          form.style.display = 'block';
        }, 5000);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      alert('There was an error submitting your information. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'STAND WITH US';
    }
  });
});
```

### Phase 2: API Endpoint (Vercel Edge Function)
```typescript
// src/pages/api/submit-lead.ts
import type { APIRoute } from "astro";
import { Octokit } from "@octokit/rest";
import crypto from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.first_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate IDs
    const timestamp = new Date().toISOString();
    const submission_id = 'sub_' + crypto.randomBytes(6).toString('hex');
    const user_id = 'usr_' + crypto.randomBytes(6).toString('hex');
    
    // Determine visitor type from postcode
    const visitor_type = determineVisitorType(data.postcode);
    
    // Create markdown content
    const fileContent = `---
timestamp: ${timestamp}
user_id: ${user_id}
name: ${data.first_name} ${data.last_name}
first_name: ${data.first_name}
last_name: ${data.last_name}
email: ${data.email}
visitor_type: ${visitor_type}
comments: "${data.comments}"
referral_code: ""
source: signup_form
submission_id: ${submission_id}
published: true
---`;
    
    // Create filename
    const date = new Date();
    const filename = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}-${submission_id}.md`;
    
    // Initialize GitHub client
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    // Create file in repository
    await octokit.repos.createOrUpdateFileContents({
      owner: 'rickhallett',
      repo: 'stadotorguk',
      path: `src/content/leads/${filename}`,
      message: `Add new lead: ${data.first_name} ${data.last_name}`,
      content: Buffer.from(fileContent).toString('base64'),
      branch: 'dev'
    });
    
    return new Response(JSON.stringify({ success: true, submission_id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

// Handle OPTIONS for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
};
```

### Phase 3: Form HTML Structure
```html
<div class="action-form">
  <form id="contactForm">
    <div class="form-group">
      <label for="name">NAME *</label>
      <input 
        type="text" 
        id="name" 
        name="name" 
        required 
        maxlength="100"
        pattern="[A-Za-z\s]+"
        title="Please enter a valid name"
      />
      <span class="error-message" data-for="name"></span>
    </div>
    
    <div class="form-group">
      <label for="email">EMAIL *</label>
      <input 
        type="email" 
        id="email" 
        name="email" 
        required 
        maxlength="255"
      />
      <span class="error-message" data-for="email"></span>
    </div>
    
    <div class="form-group">
      <label for="postcode">POSTCODE *</label>
      <input 
        type="text" 
        id="postcode" 
        name="postcode" 
        required 
        pattern="[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}"
        title="Please enter a valid UK postcode"
        maxlength="10"
      />
      <span class="error-message" data-for="postcode"></span>
    </div>
    
    <div class="form-group">
      <label for="message">YOUR STORY (OPTIONAL)</label>
      <textarea 
        id="message" 
        name="message" 
        rows="4"
        maxlength="1000"
      ></textarea>
      <small>Characters remaining: <span id="charCount">1000</span></small>
    </div>
    
    
    <button type="submit" class="submit-btn">STAND WITH US</button>
  </form>
  
  <div 
    class="form-confirmation" 
    id="formConfirmation" 
    style="display: none;"
  >
    CONFIRMED: YOU ARE NOW PART OF THE ALLIANCE
  </div>
</div>
```

## Responsive Design

### Mobile Layout (< 768px)
```css
@media (max-width: 768px) {
  .action-form {
    padding: 1.5rem;
    margin: 1rem;
    box-shadow: 8px 8px 0 var(--brutal-shadow);
  }
  
  .form-group label {
    font-size: 1rem;
  }
  
  .submit-btn {
    width: 100%;
    font-size: 1.2rem;
    padding: 1rem 2rem;
  }
  
  .form-confirmation {
    font-size: 1.2rem;
    padding: 1.5rem;
  }
}
```

## Accessibility Considerations

1. **ARIA Labels**: All form fields have associated labels
2. **Error Announcements**: Use `aria-live="polite"` for error messages
3. **Keyboard Navigation**: Full keyboard support with proper tab order
4. **Screen Reader Support**: Descriptive labels and error messages
5. **Focus Indicators**: Clear visual focus states for all interactive elements
6. **Color Contrast**: Meets WCAG AA standards (black on white, white on red)

## Animation Specifications

### Form Field Focus Animation
```css
/* Smooth elevation effect on focus */
.form-group input:focus,
.form-group textarea:focus {
  animation: fieldElevate 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fieldElevate {
  to {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 var(--brutal-shadow);
  }
}
```

### Submit Button Animation
```css
/* Loading state animation */
.submit-btn.loading::after {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 3px solid var(--brutal-white);
  border-top-color: transparent;
  border-radius: 0;
  animation: brutalSpin 0.8s linear infinite;
  margin-left: 8px;
}
```

## Success Metrics

1. **Conversion Rate**: % of homepage visitors who complete sign-up
2. **Form Completion Rate**: % of users who start vs. complete the form
3. **Error Rate**: % of submissions that fail
4. **Time to Complete**: Average time from form start to submission
5. **Lead Quality**: % of leads with complete information
6. **Duplicate Rate**: % of duplicate email submissions blocked

## Testing Requirements

### Unit Tests
```javascript
// Tests for form validation
describe('Form Validation', () => {
  test('validates email format', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });
  
  test('validates UK postcode', () => {
    expect(validatePostcode('SW1A 1AA')).toBe(true);
    expect(validatePostcode('12345')).toBe(false);
  });
  
  test('splits name correctly', () => {
    expect(splitName('John Smith')).toEqual({
      first_name: 'John',
      last_name: 'Smith'
    });
  });
});
```

### Integration Tests
- Form submission end-to-end flow
- API endpoint response handling
- GitHub file creation
- Error handling and recovery
- Rate limiting enforcement

### Browser Testing
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Form functionality without JavaScript (graceful degradation)

## Future Enhancements

1. **Email Notifications**: Send welcome email to new sign-ups
2. **Referral System**: Track and reward member referrals
3. **Progressive Profiling**: Gather additional information over time
4. **Segmentation**: Categorize leads for targeted communications
5. **Integration with Email Marketing**: Sync with Mailchimp/SendGrid
6. **A/B Testing**: Test different form variations for conversion optimization
7. **Multi-step Form**: Break long form into steps for better completion
8. **Social Sign-up**: Allow sign-up via social media accounts
9. **Analytics Dashboard**: Real-time visualization of sign-up metrics

## Dependencies

### NPM Packages
```json
{
  "@octokit/rest": "^19.0.0",
  "@types/node": "^20.0.0"
}
```

### External Services
- GitHub API (for file creation)
- Vercel Edge Functions (for serverless backend)

## Migration Path

1. **Week 1**: Implement and test Phase 1 (client-side form)
2. **Week 2**: Deploy Phase 2 (API endpoint) to staging
3. **Week 3**: Test full integration flow
4. **Week 4**: Production deployment with monitoring
5. **Week 5**: Optimization based on initial metrics

## Risk Mitigation

1. **GitHub API Limits**: Implement caching and batching
2. **Data Loss**: Regular backups of leads collection
3. **Performance**: CDN for static assets, optimized API responses

## Approval Checklist

- [ ] Form design approved by design team
- [ ] API architecture approved by backend team
- [ ] Testing plan approved by QA
- [ ] Deployment strategy approved by DevOps
- [ ] Analytics tracking approved by marketing

---

**Document Status**: Ready for Review  
**Next Steps**: Technical review and implementation planning  
**Owner**: Development Team  
**Stakeholders**: Marketing, DevOps