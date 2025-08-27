# Product Requirements Document: Legal Pages (Terms & Conditions and Privacy Policy)

**Document Version:** 1.0  
**Date:** January 2025  
**Feature:** Legal Compliance Pages  
**Priority:** High  
**Estimated Implementation Time:** 4-6 hours  

## Executive Summary

This PRD outlines the requirements for creating Terms and Conditions and Privacy Policy pages for the Swanage Traffic Alliance (STA) website. These pages are essential for legal compliance, user transparency, and protecting the organization from liability. The pages will maintain the site's brutalist design aesthetic while ensuring accessibility and readability of legal content.

## Problem Statement

### Current Issues
1. **Legal Vulnerability**: The site currently operates without terms of service or privacy policy, exposing STA to potential legal risks
2. **GDPR Non-Compliance**: Collection of user data through forms without proper privacy notices violates UK GDPR requirements
3. **User Trust**: Lack of transparent policies may deter users from submitting evidence or joining the movement
4. **Content Liability**: No clear guidelines for user-submitted content in the community feed section
5. **Data Protection**: No documented procedures for handling personal data from supporters

### User Pain Points
- Users cannot understand how their data is being used
- No clear guidelines on acceptable use of the platform
- Uncertainty about rights regarding submitted content
- No visible compliance with data protection regulations

## Requirements

### Functional Requirements

#### Terms and Conditions Page
1. **Content Sections**:
   - Acceptance of Terms
   - Website Usage Guidelines
   - User Content and Submissions Policy
   - Intellectual Property Rights
   - Evidence Submission Rules
   - Prohibited Activities
   - Disclaimers and Limitations of Liability
   - Indemnification
   - Modifications to Terms
   - Governing Law (England and Wales)
   - Contact Information

2. **Interactive Features**:
   - Table of contents with jump links
   - Last updated date prominently displayed
   - Print-friendly version
   - Acceptance tracking for form submissions

#### Privacy Policy Page
1. **Content Sections**:
   - Data Controller Information
   - Types of Information Collected
   - Collection Methods
   - Purpose of Data Processing
   - Legal Basis (Legitimate Interests, Consent)
   - Data Sharing and Third Parties
   - Data Retention Periods
   - User Rights (Access, Rectification, Erasure, Portability)
   - Cookie Policy
   - Security Measures
   - Children's Privacy (Under 16)
   - International Data Transfers
   - Policy Changes
   - Contact and Complaints Procedure

2. **Compliance Features**:
   - UK GDPR compliant language
   - ICO registration details (if applicable)
   - Clear opt-in/opt-out mechanisms
   - Data Subject Access Request process

### Technical Requirements

1. **Page Structure**:
   ```
   src/pages/
   ├── terms.astro
   └── privacy.astro
   ```

2. **URL Structure**:
   - `/terms` - Terms and Conditions
   - `/privacy` - Privacy Policy

3. **Integration Points**:
   - Footer component modification for legal links
   - Cookie consent banner implementation

### Design Requirements

1. **Visual Hierarchy**:
   - Maintain brutalist design language
   - Clear section breaks with heavy borders
   - High contrast for readability
   - Consistent typography with site standards

2. **Component Usage**:
   - Utilize existing `BrutalSection` components
   - Consistent header/footer via `Layout.astro`
   - Custom legal content containers with:
     - 8px solid black borders
     - 15px box shadow offsets
     - Concrete gray (#E5E5E5) backgrounds

3. **Typography**:
   - Headings: Arial Black, uppercase
   - Body text: Arial, 16px minimum
   - Line height: 1.6 for readability
   - Maximum line width: 75 characters

## Implementation Details

### Code Structure

#### Terms Page (`src/pages/terms.astro`)
```astro
---
import Layout from '../layouts/Layout.astro';
import BrutalSection from '../components/BrutalSection.astro';

const lastUpdated = '25 January 2025';
const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'usage', title: 'Website Usage' },
  { id: 'content', title: 'User Content' },
  // ... more sections
];
---

<Layout title="Terms and Conditions - Swanage Traffic Alliance">
  <main>
    <BrutalSection>
      <h1>TERMS AND CONDITIONS</h1>
      <p class="last-updated">Last Updated: {lastUpdated}</p>
      
      <nav class="toc">
        <h2>Contents</h2>
        <ol>
          {sections.map(section => (
            <li><a href={`#${section.id}`}>{section.title}</a></li>
          ))}
        </ol>
      </nav>

      <section id="acceptance" class="legal-section">
        <h2>1. ACCEPTANCE OF TERMS</h2>
        <p>By accessing and using the Swanage Traffic Alliance website...</p>
      </section>
      <!-- Additional sections -->
    </BrutalSection>
  </main>
</Layout>

<style>
  .legal-section {
    margin: 3rem 0;
    padding: 2rem;
    border-left: 8px solid var(--brutal-black);
  }
  
  .toc {
    background: var(--brutal-concrete);
    border: 4px solid var(--brutal-black);
    padding: 1.5rem;
    margin: 2rem 0;
  }
  
  .last-updated {
    font-weight: bold;
    color: var(--brutal-red);
    text-transform: uppercase;
  }
</style>
```

#### Privacy Page (`src/pages/privacy.astro`)
```astro
---
import Layout from '../layouts/Layout.astro';
import BrutalSection from '../components/BrutalSection.astro';

const lastUpdated = '25 January 2025';
---

<Layout title="Privacy Policy - Swanage Traffic Alliance">
  <main>
    <BrutalSection>
      <h1>PRIVACY POLICY</h1>
      <p class="last-updated">Last Updated: {lastUpdated}</p>
      
      <section class="legal-section">
        <h2>DATA CONTROLLER</h2>
        <p>Swanage Traffic Alliance ("we", "us", "our") is the data controller...</p>
      </section>
      <!-- Additional sections -->
    </BrutalSection>
  </main>
</Layout>
```

### Footer Modification
```astro
<!-- Add to Footer.astro -->
<div class="footer-legal">
  <a href="/terms">Terms & Conditions</a>
  <span class="separator">|</span>
  <a href="/privacy">Privacy Policy</a>
</div>

<style>
  .footer-legal {
    text-align: center;
    padding: 1rem 0;
    border-top: 2px solid var(--brutal-gray);
    margin-top: 1rem;
  }
  
  .footer-legal a {
    color: var(--brutal-white);
    text-decoration: none;
    text-transform: uppercase;
    font-size: 0.875rem;
    letter-spacing: 0.1em;
    transition: color 0.3s;
  }
  
  .footer-legal a:hover {
    color: #FFD700;
  }
  
  .separator {
    margin: 0 1rem;
    opacity: 0.5;
  }
</style>
```

## Legal Content Templates

### Terms and Conditions Content

```markdown
## 1. ACCEPTANCE OF TERMS

By accessing and using the Swanage Traffic Alliance (STA) website, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our website.

## 2. WEBSITE USAGE

### 2.1 Permitted Use
You may use this website for lawful purposes related to:
- Learning about traffic issues in Swanage
- Submitting evidence of traffic violations
- Participating in community discussions
- Supporting the STA campaign

### 2.2 Prohibited Activities
You must not:
- Submit false or misleading information
- Harass, intimidate, or threaten other users
- Attempt to compromise website security
- Use automated systems to scrape content
- Impersonate others or misrepresent affiliations

## 3. USER CONTENT AND SUBMISSIONS

### 3.1 Content Rights
By submitting content (including evidence, comments, and testimonials), you grant STA a non-exclusive, royalty-free, perpetual license to use, reproduce, and publish such content for campaign purposes.

### 3.2 Content Standards
All submissions must be:
- Accurate and truthful
- Respectful and non-defamatory
- Free from copyright infringement
- Relevant to traffic safety concerns

## 4. EVIDENCE SUBMISSION

### 4.1 Accuracy Requirement
Evidence submitted must be genuine and unaltered. False evidence submission may result in:
- Removal from the platform
- Report to relevant authorities
- Legal action where appropriate

### 4.2 Privacy Considerations
When submitting evidence:
- Blur faces and personal information where possible
- Focus on traffic violations, not individuals
- Respect privacy rights of third parties

## 5. INTELLECTUAL PROPERTY

### 5.1 STA Property
All STA branding, content, and materials remain our property. You may not use STA intellectual property without written permission.

### 5.2 User Submissions
You retain ownership of content you submit but grant us usage rights as outlined in Section 3.1.

## 6. LIABILITY DISCLAIMER

### 6.1 No Warranty
This website is provided "as is" without warranties of any kind. We do not guarantee:
- Continuous availability
- Error-free operation
- Accuracy of all information

### 6.2 Limitation of Liability
STA shall not be liable for any indirect, consequential, or incidental damages arising from website use.

## 7. INDEMNIFICATION

You agree to indemnify and hold harmless STA, its volunteers, and affiliates from any claims arising from your use of the website or breach of these terms.

## 8. MODIFICATIONS

We reserve the right to modify these terms at any time. Continued use after modifications constitutes acceptance of updated terms.

## 9. GOVERNING LAW

These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.

## 10. CONTACT INFORMATION

For questions about these terms:
Email: legal@swanagetraffic.org
Post: Swanage Traffic Alliance, [Address]
```

### Privacy Policy Content

```markdown
## 1. INTRODUCTION

Swanage Traffic Alliance ("STA", "we", "us", "our") is committed to protecting your privacy. This policy explains how we collect, use, and protect your personal information in compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.

## 2. DATA CONTROLLER

Swanage Traffic Alliance
Email: privacy@swanagetraffic.org
[ICO Registration Number: If applicable]

## 3. INFORMATION WE COLLECT

### 3.1 Personal Data
- Names (when provided via forms)
- Email addresses (for newsletters and updates)
- Phone numbers (if voluntarily provided)
- Postal addresses (for campaign materials)

### 3.2 Usage Data
- IP addresses
- Browser types and versions
- Pages visited and time spent
- Referring websites

### 3.3 Submitted Content
- Evidence of traffic violations
- Community feed posts
- Campaign testimonials

## 4. HOW WE COLLECT INFORMATION

### 4.1 Direct Collection
- Newsletter signup forms
- Evidence submission forms
- Contact forms
- Community feed submissions

### 4.2 Automatic Collection
- Server logs
- Analytics tools
- Cookies (see Section 9)

## 5. HOW WE USE YOUR INFORMATION

We process your data for:
- Sending campaign updates and newsletters
- Processing evidence submissions
- Responding to inquiries
- Improving website functionality
- Statistical analysis of traffic patterns
- Legal compliance

## 6. LEGAL BASIS FOR PROCESSING

We process your data based on:
- **Consent**: For newsletters and marketing
- **Legitimate Interests**: For campaign activities and website operation
- **Legal Obligations**: Where required by law
- **Vital Interests**: In emergency situations

## 7. DATA SHARING

### 7.1 We DO NOT sell your data
Your information is never sold to third parties.

### 7.2 Limited Sharing
We may share data with:
- Law enforcement (when legally required)
- Legal advisors (under confidentiality)
- Technical service providers (under data processing agreements)

## 8. DATA RETENTION

- Newsletter subscribers: Until unsubscribe request
- Evidence submissions: 7 years
- Website analytics: 26 months
- Contact form inquiries: 2 years

## 9. YOUR RIGHTS

Under UK GDPR, you have the right to:
- **Access**: Request copies of your data
- **Rectification**: Correct inaccurate data
- **Erasure**: Request deletion (subject to legal requirements)
- **Restriction**: Limit processing
- **Portability**: Receive data in machine-readable format
- **Object**: Oppose certain processing activities

To exercise these rights, contact: privacy@swanagetraffic.org

## 10. COOKIES

### 10.1 Essential Cookies
Required for website functionality (session management, security).

### 10.2 Analytics Cookies
Help us understand website usage (optional, requires consent).

### 10.3 Managing Cookies
You can control cookies through browser settings. Disabling essential cookies may affect website functionality.

## 11. SECURITY

We implement appropriate technical and organizational measures including:
- Encryption of data in transit (HTTPS)
- Regular security assessments
- Access controls and authentication
- Staff training on data protection

## 12. CHILDREN'S PRIVACY

We do not knowingly collect data from individuals under 16. If we discover such collection, we will promptly delete the information.

## 13. INTERNATIONAL TRANSFERS

Your data is primarily stored in the UK. Any international transfers will be protected by appropriate safeguards under UK GDPR.

## 14. CHANGES TO THIS POLICY

We may update this policy periodically. Significant changes will be announced via website notice or email.

## 15. COMPLAINTS

If you have concerns about our data handling:
1. Contact us at privacy@swanagetraffic.org
2. You may lodge a complaint with the Information Commissioner's Office (ICO)
   Website: ico.org.uk
   Helpline: 0303 123 1113

## 16. DATA PROTECTION OFFICER

[If applicable, include DPO contact details]
```

## Responsive Design

### Mobile Considerations
```css
@media (max-width: 768px) {
  .legal-section {
    padding: 1rem;
    margin: 2rem 0;
  }
  
  .toc {
    position: static;
    width: 100%;
    margin-bottom: 2rem;
  }
  
  h1 {
    font-size: 1.75rem;
  }
  
  h2 {
    font-size: 1.25rem;
  }
  
  body {
    font-size: 14px;
  }
}
```

### Print Styles
```css
@media print {
  .site-header,
  .site-footer,
  .toc {
    display: none;
  }
  
  .legal-section {
    page-break-inside: avoid;
    border: none;
    box-shadow: none;
  }
  
  body {
    font-size: 12pt;
    line-height: 1.5;
    color: black;
    background: white;
  }
}
```

## Accessibility Considerations

1. **WCAG 2.1 AA Compliance**:
   - Minimum contrast ratio 4.5:1 for body text
   - 3:1 for large text
   - Keyboard navigation for all interactive elements

2. **Screen Reader Support**:
   - Proper heading hierarchy (h1 → h2 → h3)
   - Descriptive link text
   - ARIA labels where needed

3. **Cognitive Accessibility**:
   - Clear, simple language where possible
   - Consistent layout and navigation
   - Visual breaks between sections

## Implementation Checklist

- [ ] Create `terms.astro` page with full content
- [ ] Create `privacy.astro` page with full content
- [ ] Update Footer component with legal links
- [ ] Add last updated dates to both pages
- [ ] Implement table of contents with jump links
- [ ] Add print-friendly styles
- [ ] Test mobile responsiveness
- [ ] Verify WCAG compliance
- [ ] Add meta descriptions for SEO
- [ ] Implement structured data markup
- [ ] Test all internal links
- [ ] Review with legal advisor
- [ ] Add cookie consent banner (separate implementation)
- [ ] Create data request handling process
- [ ] Document version control process

## Success Metrics

1. **Compliance Metrics**:
   - 100% GDPR compliance checkpoints met
   - Zero accessibility violations (WAVE tool)
   - All required legal sections included

2. **User Metrics**:
   - < 5% bounce rate on legal pages
   - Average time on page > 30 seconds
   - < 10 privacy-related support inquiries/month

3. **Technical Metrics**:
   - Page load time < 2 seconds
   - 100% mobile compatibility
   - Print layout renders correctly

## Future Enhancements

1. **Version 1.1** (Q2 2025):
   - Cookie consent management system
   - Automated policy update notifications
   - Multi-language support (Welsh)

2. **Version 1.2** (Q3 2025):
   - Data request portal
   - Consent preference center
   - Age verification system

3. **Version 2.0** (Q4 2025):
   - AI-powered policy summarizer
   - Interactive consent flow
   - Integration with CRM for consent tracking

## Risk Assessment

### High Priority Risks
1. **Non-compliance with UK GDPR**: Implement comprehensive privacy policy immediately
2. **User data breach**: Ensure security measures are documented and followed
3. **Invalid consent collection**: Clear opt-in mechanisms required

### Mitigation Strategies
1. Regular legal review (quarterly)
2. Security audit schedule
3. User consent audit trail
4. Clear documentation of data flows

## Notes

- Ensure all email addresses (legal@, privacy@) are configured and monitored
- Consider legal review before publication
- Set up regular review schedule (minimum annually)
- Create internal process for handling data requests
- Document all third-party services and their data practices
- Maintain change log for all policy updates