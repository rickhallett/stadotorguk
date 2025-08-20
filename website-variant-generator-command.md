# **WEBSITE VARIANT GENERATOR - INFINITE AGENTIC LOOP COMMAND**

Think deeply about this website copy variant generation task. You are about to create multiple unique messaging variants of the Swanage Traffic Alliance website, each with distinct copy while maintaining the brutalist design.

## **Variables:**

spec_file: `variants.md`
prd_file: `website-variant-generator-prd.md`
output_dir: `src/pages/`
count: $ARGUMENTS

## **ARGUMENTS PARSING:**
Parse the following argument from "$ARGUMENTS":
1. `count` - Number of variants to generate (1-N or "infinite")

## **PHASE 1: SPECIFICATION ANALYSIS**

### 1.1 Read Core Documentation
Read and deeply understand the following files:
- **PRD**: `website-variant-generator-prd.md` - Complete requirements and structure
- **Variants Config**: `variants.md` - Theme definitions and variant specifications
- **Current Copy**: `copy_sections_current.md` - Reference for tone and structure
- **Template Structure**: `copy_sections_edit.md` - Exact fields to populate

### 1.2 Analyze Variant Requirements
For each variant defined in `variants.md`, understand:
- **Theme**: Core messaging approach (Legal, Community, Data-driven, etc.)
- **Tone**: Writing style and voice characteristics
- **Key Messages**: 3-5 core points to emphasize
- **Target Audience**: Who this variant speaks to
- **Vocabulary**: Specific terms and language patterns
- **CTA Focus**: How to frame calls-to-action

### 1.3 Content Structure Mapping
Map the required copy sections to actual page locations:
- **Global**: Header/Footer components (variant-aware)
- **Home**: 6 major sections with ~30 copy points
- **Feed**: 4 sections plus 8-10 sample community posts
- **News**: 4 sections plus 6-8 timeline items
- **Supporters**: 5 sections plus 6-8 testimonials

## **PHASE 2: OUTPUT DIRECTORY RECONNAISSANCE**

### 2.1 Analyze Existing Variants
Thoroughly scan `src/pages/` to identify:
- Which variant directories already exist (v1/, v2/, etc.)
- Highest variant number currently present
- Any partial or incomplete variants needing completion
- Source page structure from original files

### 2.2 Source File Analysis
Examine original pages to understand:
- Exact HTML/Astro structure to preserve
- Component usage and prop passing
- Current copy placement and formatting
- Internal link patterns to update

### 2.3 Determine Generation Strategy
Based on existing state:
- Starting variant number (highest existing + 1)
- Which variants from `variants.md` haven't been generated
- Gap-filling opportunities for incomplete variants
- If count is "infinite", prepare for continuous generation

## **PHASE 3: VARIANT GENERATION STRATEGY**

### 3.1 Copy Evolution Framework
Each variant must be genuinely unique:
- **Legal Focus (v1)**: Prosecutorial language, evidence-based, constitutional violations
- **Community Unity (v2)**: Collective action, solidarity, grassroots empowerment
- **Data-Driven (v3)**: Statistical analysis, percentages, objective metrics
- **Emergency Response (v4)**: Safety concerns, critical delays, life-threatening
- **Economic Impact (v5)**: Business losses, revenue impacts, economic damage
- **[Additional variants]**: Progressive sophistication with each new variant

### 3.2 Content Requirements Per Variant
Each variant needs complete copy for:

**HOME PAGE (~45 copy elements)**
- Hero: Headline, subheadline, data block
- Introduction: Heading, 200-300 word body, pull quote, data stat
- Survey Section: Title, chart labels, 4 evidence points
- Impact Analysis: 4 impact cards with metrics
- Democratic Deficit: 3 evidence cards
- CTA: Form heading, field labels, button, confirmation

**FEED PAGE (~25 copy elements + posts)**
- Hero: Headline, subheadline
- Counter: Title, countdown, 4 labels
- Feed: Title, 100-150 word intro, 8-10 posts (50-100 words each)
- Join CTA: Heading, body, button

**NEWS PAGE (~20 copy elements + timeline)**
- Hero: Headline, subheadline
- Timeline: 6-8 news items with dates/headlines/descriptions
- Stay Informed: 3 info cards
- Urgent Action: Headline, body, 2 buttons

**SUPPORTERS PAGE (~30 copy elements + testimonials)**
- Hero: Heading, subtitle
- Breakdown: Title, 3 categories
- Testimonies: 6-8 testimonials (100-200 words each)
- Recent: 15-20 names, view button
- Join: Heading, body, button

## **PHASE 4: PARALLEL AGENT COORDINATION**

### 4.1 Sub-Agent Distribution Strategy
Deploy specialized copy-generation agents:
- **For 1-5 variants**: Launch all agents simultaneously
- **For 6-10 variants**: Launch in 2 batches of 5
- **For "infinite"**: Launch waves of 3-5 agents, monitoring context

### 4.2 Agent Assignment Protocol
Each Sub Agent receives:
1. **Variant Specification**: Complete theme/tone/vocabulary from `variants.md`
2. **PRD Context**: Full requirements from `website-variant-generator-prd.md`
3. **Template Structure**: Exact fields from `copy_sections_edit.md`
4. **Source Files**: Original .astro pages to modify
5. **Output Path**: `src/pages/v[N]/` directory
6. **Uniqueness Directive**: Must differ 70%+ from other variants

### 4.3 Agent Task Specification
```
TASK: Generate Website Variant [ID] - [THEME]

You are Sub Agent [X] generating variant [ID] with theme [THEME].

INPUTS:
- Variant specification from variants.md
- Complete PRD requirements
- Template structure from copy_sections_edit.md
- Source pages from src/pages/
- Current copy reference from copy_sections_current.md

COPY GENERATION REQUIREMENTS:
1. Generate ALL copy elements for 4 pages (home, feed, news, supporters)
2. Maintain consistent [THEME] tone throughout
3. Use [VOCABULARY] specified for this variant
4. Target [AUDIENCE] with appropriate messaging
5. Create realistic, contextual content (no lorem ipsum)
6. Include believable statistics and data points
7. Write compelling testimonials and community posts
8. Ensure CTAs align with [CTA_FOCUS]

FILE CREATION REQUIREMENTS:
1. Create directory: src/pages/v[N]/
2. Create supporters subdirectory: src/pages/v[N]/supporters/
3. Duplicate all .astro files from source
4. Replace ALL text content with variant copy
5. Update internal links to use /v[N]/ paths
6. Preserve all HTML structure and styling
7. Maintain Astro component syntax

QUALITY STANDARDS:
- Grammar and spelling must be perfect
- Tone consistency across all pages
- Statistics must be believable and consistent
- No duplicate content with other variants
- All sections must have complete copy
- Links must stay within variant (/v[N]/)

DELIVERABLE: Complete functional variant in src/pages/v[N]/ with all pages
```

### 4.4 Parallel Execution Management
Coordinate multiple agents efficiently:
- Launch assigned Sub Agents using Task tool
- Monitor each agent's progress
- Validate completed variants immediately
- Handle failures with reassignment
- Ensure no duplicate variant numbers
- Maintain quality across parallel streams

## **PHASE 5: INFINITE MODE ORCHESTRATION**

### 5.1 Wave-Based Generation
For infinite generation, orchestrate continuous waves:

**Wave Planning Strategy:**
- **Wave 1 (v1-v5)**: Core themes from initial variants.md
- **Wave 2 (v6-v10)**: Hybrid themes combining approaches
- **Wave 3 (v11-v15)**: Advanced messaging strategies
- **Wave N**: Revolutionary activist messaging paradigms

### 5.2 Progressive Theme Sophistication

**Wave 1 - Foundational Themes:**
- Legal Focus: Constitutional violations
- Community Unity: Grassroots solidarity
- Data-Driven: Statistical evidence
- Emergency Response: Safety crisis
- Economic Impact: Business damage

**Wave 2 - Hybrid Approaches:**
- Legal + Data: Evidence-based prosecution
- Community + Emergency: Neighbors saving lives
- Economic + Legal: Financial violations
- Data + Emergency: Response time analytics
- Community + Economic: Local business solidarity

**Wave 3 - Advanced Strategies:**
- Investigative journalism angle
- Historical precedent focus
- Environmental justice frame
- Digital resistance approach
- International solidarity perspective

**Wave N - Revolutionary Concepts:**
- Blockchain transparency demands
- AI-analyzed manipulation exposure
- Crowd-sourced investigation platform
- Decentralized governance alternative
- Direct action coordination hub

### 5.3 Infinite Execution Cycle
```
WHILE context_capacity > threshold:
    1. Assess current variants in src/pages/
    2. Determine next wave themes (progressively sophisticated)
    3. Generate variant specifications for wave
    4. Launch parallel Sub Agent wave (3-5 agents)
    5. Monitor wave completion and quality
    6. Validate all generated variants
    7. Update variant index/documentation
    8. Evaluate context capacity remaining
    9. If sufficient: Plan next wave with evolved themes
    10. If approaching limits: Complete final wave and summarize
```

### 5.4 Context Optimization
Manage context efficiently across waves:
- Each wave uses fresh agent instances
- Progressive summarization of completed variants
- Lightweight tracking of themes used
- Strategic pruning of verbose descriptions
- Focus on copy generation, not explanation

## **PHASE 6: QUALITY ASSURANCE**

### 6.1 Automated Validation
After each variant generation:
- Verify all required files exist
- Check copy completeness (no empty sections)
- Validate internal links use /v[N]/ format
- Ensure Astro syntax remains valid
- Confirm theme consistency throughout

### 6.2 Content Quality Checks
- Grammar and spelling verification
- Tone consistency within variant
- Statistic believability and consistency
- CTA alignment with theme
- Testimonial authenticity
- No duplicate content between variants

### 6.3 Technical Validation
- Page routing works (/v1/, /v2/, etc.)
- Navigation stays within variant
- Components render correctly
- Mobile responsiveness maintained
- Forms remain functional

## **EXECUTION PRINCIPLES**

### Quality & Uniqueness
- Each variant must offer genuine value
- Minimum 70% unique copy between variants
- Maintain professional activist tone
- Ensure factual consistency (dates, places)
- Create believable, contextual content

### Parallel Coordination
- Maximize creative diversity through parallel execution
- Assign distinct themes to prevent overlap
- Coordinate file creation to prevent conflicts
- Monitor all agents for quality and completion
- Handle failures gracefully with reassignment

### Scalability & Efficiency
- Optimize for maximum variants before context exhaustion
- Use wave-based generation for infinite mode
- Balance parallel speed with content quality
- Progressive sophistication across waves
- Strategic context management

## **ULTRA-THINKING DIRECTIVE**

Before beginning generation, engage in extended thinking about:

### Copy Generation Strategy
- How to create genuinely unique variants
- Maintaining consistency within each variant
- Balancing activism with variant themes
- Creating believable statistics and data
- Writing authentic testimonials and posts

### Parallel Coordination
- Optimal agent distribution for requested count
- Theme assignment to maximize diversity
- Wave sizing for infinite mode
- Context management across agents
- Quality control mechanisms

### Technical Implementation
- File structure creation and management
- Link updating patterns
- Component prop passing
- Astro syntax preservation
- Route configuration updates

### Risk Mitigation
- Agent failure recovery
- Duplicate content prevention
- Link validation strategies
- Theme consistency enforcement
- Context limit management

## **EXECUTION COMMAND**

Begin execution with:
1. Deep analysis of PRD and variants.md
2. Assessment of current src/pages/ state
3. Determination of starting variant number
4. Launch of parallel Sub Agents for generation
5. Continuous monitoring and validation
6. Progressive wave deployment for infinite mode

Execute with maximum efficiency, creative diversity, and quality assurance. Each variant should feel like a completely different activist organization while maintaining the same core facts and brutalist design aesthetic.