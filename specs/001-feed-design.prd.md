# Feed Page Design Requirements (PRD)
## Document Version: 1.0
## Date: August 20, 2025

---

## 1. Executive Summary

This PRD outlines the design requirements for updating the Feed page's counter section to improve visual consistency and implement a dynamic countdown timer for the September 15 council vote.

---

## 2. Problem Statement

### Current Issues:
1. **Static "NOW" text** - Doesn't provide actionable information about time remaining
2. **Inconsistent element widths** - Total active members block spans full width while statistics blocks are smaller
3. **Unequal block sizing** - The three blue statistics blocks don't align with the elements above
4. **Poor visual hierarchy** - Layout doesn't guide the eye effectively through the information

---

## 3. Requirements

### 3.1 Dynamic Countdown Timer

#### Functional Requirements:
- Replace "NOW" with actual number of days remaining until September 15, 2025
- Calculate days dynamically based on current date
- Update countdown daily at midnight local time
- Display format: "[NUMBER]" in large text with "DAYS UNTIL SEPTEMBER 15 VOTE" below

#### Technical Specifications:
- Client-side JavaScript calculation to ensure real-time accuracy
- Fallback to server-side calculation if JavaScript disabled
- Handle edge cases:
  - "TODAY" when 0 days remaining
  - "TOMORROW" when 1 day remaining
  - Number for all other cases

#### Visual Design:
- Maintain existing red background (#FF4500 or similar brutal red)
- White text, bold font weight
- Font size: Same scale as current "NOW" text
- Add subtle pulse animation to draw attention

---

### 3.2 Member Counter Display

#### Layout Requirements:
- Total Active Members block should match width of countdown block above
- Remove full-width spanning behavior
- Maintain yellow background (#FFD700)
- Center-align content within container

#### Typography:
- Number: Large, bold (same size as current)
- Label: Smaller, uppercase text below
- Consistent padding on all sides

---

### 3.3 Statistics Blocks Grid

#### Grid Layout:
- Three equal-width columns
- Combined width should match the countdown and member counter blocks above
- Consistent gap between blocks (16px recommended)
- Stack vertically on mobile (< 768px)

#### Individual Block Styling:
- Blue background (#0066CC or similar brutal blue)
- White text
- Equal padding (24px recommended)
- Center-aligned content
- Hover effect: Slight scale transform (1.02) with transition

#### Content Structure:
Each block contains:
1. Large number (bold, prominent)
2. Label text (smaller, uppercase)
   - "JOINED TODAY"
   - "JOINED THIS WEEK"
   - "JOINED THIS MONTH"

---

## 4. Responsive Design

### Desktop (> 768px):
```
┌─────────────────────────────────┐
│    COUNTDOWN (Red)              │
├─────────────────────────────────┤
│    TOTAL MEMBERS (Yellow)       │
├───────────┬───────────┬─────────┤
│  TODAY    │   WEEK    │  MONTH  │
│  (Blue)   │  (Blue)   │ (Blue)  │
└───────────┴───────────┴─────────┘
```

### Mobile (< 768px):
```
┌─────────────────┐
│   COUNTDOWN     │
├─────────────────┤
│  TOTAL MEMBERS  │
├─────────────────┤
│     TODAY       │
├─────────────────┤
│     WEEK        │
├─────────────────┤
│     MONTH       │
└─────────────────┘
```

---

## 5. Implementation Notes

### CSS Grid Approach:
```css
.counter-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0; /* No gap between countdown and total */
  max-width: 800px; /* Constrain width */
  margin: 0 auto;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }
}
```

### JavaScript Countdown Logic:
```javascript
function calculateDaysUntil() {
  const targetDate = new Date('2025-09-15');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'TODAY';
  if (diffDays === 1) return 'TOMORROW';
  if (diffDays < 0) return 'VOTE PASSED';
  return diffDays.toString();
}
```

---

## 6. Accessibility Considerations

- Ensure sufficient color contrast (WCAG AA minimum)
- Add ARIA labels for screen readers
- Include semantic HTML structure
- Countdown should announce changes to screen readers
- Keyboard navigation support for interactive elements

---

## 7. Animation Specifications

### Countdown Pulse:
- Subtle scale animation (0.98 to 1.02)
- Duration: 2s
- Easing: ease-in-out
- Infinite loop

### Counter Animation:
- Numbers should animate from 0 to final value on page load
- Duration: 2s
- Easing: ease-out
- Stagger delay for each statistic block (0.2s increments)

---

## 8. Success Metrics

- Visual consistency across all counter elements
- Clear information hierarchy
- Improved user engagement with countdown timer
- Mobile-responsive layout maintains readability
- Page load performance remains under 3 seconds

---

## 9. Future Enhancements

- Real-time member count updates via WebSocket
- Historical trend graphs for membership growth
- Geographical distribution visualization
- Integration with backend API for live data
- Social sharing functionality for milestones