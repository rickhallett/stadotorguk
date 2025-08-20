# Product Requirements Document: Website Copy Variant Generator

## 1. Executive Summary

### 1.1 Purpose
Create an automated system to generate multiple copy variants of the Swanage Traffic Alliance website, each with unique messaging while maintaining the same brutalist design and structure. Variants will be defined in a configuration file and accessible via versioned routes.

### 1.2 Goals
- Generate 10+ distinct copy variants from a single specification file
- Maintain consistent design/layout while varying all text content
- Create versioned routes for each variant (e.g., `/v1/`, `/v2/`, `/v3/`)
- Preserve the activist tone while exploring different messaging strategies
- Enable parallel generation for efficiency

### 1.3 Success Criteria
- All variants defined in `variants.md` are successfully generated
- Each variant contains complete, unique copy (no placeholders)
- Variant themes are clearly differentiated
- File structure matches specification exactly
- All pages accessible via versioned routes
- Zero broken links or missing content

## 2. System Architecture

### 2.1 Input Files
```
/
├── variants.md              # Variant specifications (to be created)
├── copy_sections_current.md # Current copy reference
├── copy_sections_edit.md    # Template structure for copy
└── src/pages/              # Source pages to duplicate
    ├── index.astro
    ├── feed.astro
    ├── news.astro
    └── supporters/
        └── index.astro
```

### 2.2 Output Structure
```
src/pages/
├── [original files]
├── v1/
│   ├── index.astro
│   ├── feed.astro
│   ├── news.astro
│   └── supporters/
│       └── index.astro
├── v2/
│   ├── index.astro
│   ├── feed.astro
│   ├── news.astro
│   └── supporters/
│       └── index.astro
└── v[N]/...
```

### 2.3 Component Architecture
- Existing components remain unchanged
- Copy is replaced at the page level
- Components receive text via props where needed
- Styling and structure preserved across all variants

## 3. Variant Specification Format

### 3.1 variants.md Structure
```markdown
# Website Copy Variants Configuration

## Variant 1: Legal Focus
**ID:** v1
**Theme:** Aggressive Legal Action
**Tone:** Prosecutorial, evidence-based, formal
**Key Messages:**
- Judicial review preparation
- Constitutional violations documented
- Legal precedents and case law
- Evidence trail for prosecution
**Target Audience:** Legal professionals, rights advocates, journalists
**Vocabulary:** Legal terminology, constitutional references, procedural violations
**CTA Focus:** Submit evidence, document violations, join legal action

## Variant 2: Community Unity
**ID:** v2
**Theme:** Grassroots Solidarity
**Tone:** Inspirational, collective, empowering
**Key Messages:**
- People power and collective action
- Community resilience and support
- Democratic participation
- Neighbor helping neighbor
**Target Audience:** Local residents, community groups, families
**Vocabulary:** Unity, together, community, solidarity, collective
**CTA Focus:** Join the movement, stand together, community action

## Variant 3: Data-Driven
**ID:** v3
**Theme:** Statistical Evidence
**Tone:** Analytical, factual, objective
**Key Messages:**
- Statistical analysis of survey flaws
- Data visualization of impacts
- Numerical evidence of bias
- Quantifiable community harm
**Target Audience:** Analysts, researchers, data scientists
**Vocabulary:** Statistics, percentages, data points, analysis, metrics
**CTA Focus:** Analyze data, contribute research, verify findings

## Variant 4: Emergency Response
**ID:** v4
**Theme:** Public Safety Crisis
**Tone:** Urgent, concerned, protective
**Key Messages:**
- Emergency service delays
- Life-threatening response times
- Public safety compromised
- Critical infrastructure failure
**Target Audience:** Emergency services, healthcare workers, families
**Vocabulary:** Emergency, critical, safety, response time, life-saving
**CTA Focus:** Report delays, document emergencies, protect lives

## Variant 5: Economic Impact
**ID:** v5
**Theme:** Business and Economic Damage
**Tone:** Business-focused, economic, pragmatic
**Key Messages:**
- Lost revenue for local businesses
- Economic impact on tourism
- Property value decline
- Job losses and closures
**Target Audience:** Business owners, property owners, investors
**Vocabulary:** Revenue, economic impact, business losses, investment
**CTA Focus:** Report losses, join business alliance, economic action

[Additional variants 6-10 to be defined...]
```

### 3.2 Required Fields per Variant
- **ID**: Unique identifier (v1, v2, etc.)
- **Theme**: Overall messaging theme
- **Tone**: Writing style and voice
- **Key Messages**: 3-5 core messages
- **Target Audience**: Primary audience
- **Vocabulary**: Key terms and language style
- **CTA Focus**: Call-to-action emphasis

## 4. Content Generation Requirements

### 4.1 Global Components

#### Header (All Variants)
- Logo text variation (e.g., "STA", "ALLIANCE", "RESISTANCE")
- Navigation labels appropriate to variant theme

#### Footer (All Variants)
- Three section headings matching variant tone
- Contact methods appropriate to theme
- Copyright message variation

### 4.2 Home Page Requirements

#### Hero Section
- **Main Headline**: 3-5 words, maximum impact
- **Subheadline**: 4-8 words, supporting message
- **Data Block Label**: Key statistic label
- **Data Block Status**: Current status indicator

#### Introduction Section
- **Heading**: 2-3 words
- **Body Text**: 200-300 words matching variant tone
- **Pull Quote**: 10-15 words, memorable and impactful
- **Data Block**: Relevant statistic with description

#### Traffic/Survey Section
- **Section Title**: 3-5 words
- **Chart Title**: 3-4 words
- **3 Bar Chart Labels**: Each with stat and description
- **Evidence Block Title**: 2-3 words
- **4 Evidence List Items**: 15-20 words each

#### Impact Analysis Section
- **Section Title**: 3-4 words
- **4 Impact Cards**: Each with metric and description

#### Democratic Deficit Section
- **Section Title**: 3-4 words
- **3 Evidence Cards**: Each with title, stat, and description

#### Call to Action Section
- **Main Heading**: 10-20 words
- **Form Field Labels**: 4 fields
- **Submit Button**: 2-3 words
- **Confirmation Message**: 8-12 words

### 4.3 Feed Page Requirements

#### Hero Section
- **Main Headline**: 2-3 words
- **Subheadline**: 6-10 words

#### Counter Section
- **Section Title**: 3-4 words
- **Countdown Label**: 5-7 words
- **4 Counter Labels**: Each 3-4 words

#### Feed Section
- **Section Title**: 2-3 words
- **Introduction Text**: 100-150 words
- **8-10 Sample Posts**: Each 50-100 words
- **Load More Button**: 3-4 words

#### Join CTA Section
- **Heading**: 3-4 words
- **Body Text**: 30-50 words
- **Button**: 3-4 words

### 4.4 News Page Requirements

#### Hero Section
- **Main Headline**: 2-3 words
- **Subheadline**: 5-8 words

#### Timeline Section
- **6-8 News Items**: Each with:
  - Date
  - Headline (5-10 words)
  - Description (30-50 words)
- **Ongoing Indicator**: 3-5 words

#### Stay Informed Section
- **Section Title**: 2-3 words
- **3 Info Cards**: Each with title, detail, description

#### Urgent Action Section
- **Main Headline**: 5-8 words
- **Body Text**: 30-50 words
- **2 Button Texts**: Each 3-4 words

### 4.5 Supporters Page Requirements

#### Hero Section
- **Main Heading**: 4-6 words
- **Subtitle**: 6-10 words

#### Breakdown Section
- **Section Title**: 3-4 words
- **3 Category Labels**: Each with count indicator

#### Testimonies Section
- **Section Title**: 4-5 words
- **6-8 Testimonials**: Each 100-200 words

#### Recent Supporters Section
- **Section Title**: 2-3 words
- **15-20 Names**: Realistic supporter names
- **View All Button**: 4-5 words

#### Join Section
- **Heading**: 3-4 words
- **Body Text**: 40-60 words
- **Button**: 3-4 words

## 5. Agent Implementation Process

### 5.1 Execution Phases

#### Phase 1: Initialization
1. Read and parse `variants.md`
2. Validate variant specifications
3. Check source file availability
4. Prepare output directories

#### Phase 2: Parallel Generation
1. Launch one Sub Agent per variant
2. Each agent receives:
   - Specific variant configuration
   - Template structures
   - Source files
   - Output path

#### Phase 3: Content Generation
Each agent must:
1. Generate complete copy for all sections
2. Maintain variant tone consistently
3. Create realistic, contextual content
4. Ensure no placeholder text

#### Phase 4: File Creation
1. Create variant directory structure
2. Duplicate .astro files
3. Replace all copy with generated content
4. Update internal links for variant paths
5. Preserve all styling and components

### 5.2 Parallel Processing Strategy

#### Agent Distribution
- **1-5 variants**: Launch simultaneously
- **6-10 variants**: Launch in 2 batches
- **10+ variants**: Launch in batches of 5

#### Agent Task Template
```
TASK: Generate Website Variant [ID] - [THEME]

CONTEXT:
- Variant specification from variants.md
- Template structure from copy_sections_edit.md
- Source pages from src/pages/
- Output directory: src/pages/v[N]/

REQUIREMENTS:
1. Read and understand variant specification
2. Generate all copy matching theme and tone
3. Create complete page files in output directory
4. Ensure internal links use variant path
5. Maintain brutalist design and activism spirit
6. No placeholder text or lorem ipsum
7. All content must be realistic and contextual

DELIVERABLE: Complete functional variant in src/pages/v[N]/
```

## 6. Quality Assurance

### 6.1 Validation Criteria
- [ ] All sections have complete copy
- [ ] No empty fields or placeholders
- [ ] Copy matches variant theme/tone
- [ ] Internal links use correct variant path
- [ ] File structure matches specification
- [ ] Astro syntax remains valid
- [ ] No duplicate content between variants

### 6.2 Testing Requirements
- [ ] All pages load without errors
- [ ] Navigation stays within variant
- [ ] Forms maintain functionality
- [ ] Mobile responsiveness preserved
- [ ] Component styling consistent

### 6.3 Content Quality Checks
- [ ] Copy is grammatically correct
- [ ] Tone consistent throughout variant
- [ ] Statistics and data are realistic
- [ ] CTAs are compelling and appropriate
- [ ] Testimonials sound authentic

## 7. Technical Implementation

### 7.1 Routing Configuration
Update routing to support variant paths:
- `/v1/*` → `src/pages/v1/`
- `/v2/*` → `src/pages/v2/`
- Original routes remain as default

### 7.2 Link Management
Internal links must be updated:
- Home: `/` → `/v[N]/`
- Feed: `/feed` → `/v[N]/feed`
- News: `/news` → `/v[N]/news`
- Supporters: `/supporters` → `/v[N]/supporters`

### 7.3 Asset Handling
- Images and static assets remain shared
- CSS and components unchanged
- Only text content varies

## 8. Execution Commands

### 8.1 Agent Launch Command
```bash
# Primary execution command
execute-variant-generator \
  --spec variants.md \
  --output src/pages/ \
  --parallel true \
  --validate true
```

### 8.2 Validation Command
```bash
# Verify all variants generated correctly
validate-variants \
  --check-links true \
  --check-content true \
  --check-structure true
```

## 9. Deliverables

### 9.1 Required Outputs
1. **Variant Directories**: Complete v1-v[N] directories
2. **Page Files**: All .astro files with unique copy
3. **Functional Routes**: Working /v[N]/ paths
4. **Variant Index**: Optional index of all variants
5. **Generation Log**: Record of variants created

### 9.2 Documentation
- List of variants generated
- Theme and tone for each variant
- Any generation issues or warnings
- Testing results

## 10. Example Variant Copy Snippets

### Variant 1 (Legal Focus) - Hero Section
```
Main Headline: "JUSTICE DELAYED DENIED"
Subheadline: "CONSTITUTIONAL VIOLATIONS DOCUMENTED"
Data Block: "387 ILLEGAL RESPONSES | EVIDENCE SECURED"
```

### Variant 2 (Community Unity) - Hero Section
```
Main Headline: "UNITED WE STAND"
Subheadline: "NEIGHBORS DEFENDING NEIGHBORS"
Data Block: "1,247 VOICES STRONG | GROWING DAILY"
```

### Variant 3 (Data-Driven) - Hero Section
```
Main Headline: "NUMBERS DON'T LIE"
Subheadline: "STATISTICAL PROOF OF MANIPULATION"
Data Block: "71% SAMPLING BIAS | PROVEN"
```

## 11. Risk Mitigation

### 11.1 Potential Issues
- Agent failures during generation
- Duplicate content between variants
- Broken internal links
- Inconsistent tone within variant
- Missing sections or pages

### 11.2 Mitigation Strategies
- Implement retry logic for failed agents
- Validate uniqueness across variants
- Test all internal links post-generation
- Review samples before full generation
- Use checksums to verify completeness

## 12. Future Enhancements

### 12.1 Potential Additions
- A/B testing framework integration
- Analytics per variant
- Dynamic variant selection
- User preference storage
- Automated copy optimization

### 12.2 Scalability Considerations
- Database-driven copy management
- CMS integration for variant editing
- API for variant selection
- Performance optimization for many variants

---

## Appendix A: Copy Section Mapping

Maps `copy_sections_edit.md` fields to .astro file locations for reference during implementation.

## Appendix B: Variant Theme Examples

Extended examples of copy for each variant theme to guide generation.

## Appendix C: Validation Checklist

Comprehensive checklist for post-generation validation.