# EdgeJournal Development Plans

This folder contains detailed sub-plans for each phase of the TradeZella feature parity roadmap.

## Structure

```
plans/
├── README.md                   # This file
├── phase-1-trade-log.md        # Enhanced Trade Log and Filtering (DETAILED)
├── phase-2-strategies.md       # Strategy System
├── phase-3-dashboard.md        # Dashboard Customization
├── phase-4-analytics.md        # Advanced Analytics
├── phase-5-trade-detail.md     # Trade Detail Enhancements
├── phase-6-notebook.md         # Notebook System
├── phase-7-replay.md           # Trade Replay
├── phase-8-backtesting.md      # Backtesting
├── phase-9-brokers.md          # Broker Integrations
├── phase-10-mobile.md          # Mobile Optimization
└── phase-11-social.md          # Educational and Social
```

## How to Use

1. **Start with the main roadmap** at `../ROADMAP.md`
2. **When starting a phase**, flesh out the corresponding sub-plan file with detailed tasks
3. **Track progress** using the checkboxes and status columns
4. **Add notes** at the bottom of each plan as you implement

## Sub-Plan Template

Each sub-plan should follow this structure:

```markdown
# Phase X: [Name]

> **Parent:** [../ROADMAP.md](../ROADMAP.md)
> **Priority:** HIGH/MEDIUM/LOW | **Dependencies:** Phase X | **Estimate:** X weeks
> **Status:** ⏳ Not Started / 🔄 In Progress / ✅ Complete

---

## Overview
Brief description of what this phase accomplishes.

---

## Sprint Breakdown

### Sprint X.1: [Name]

**Goal:** What this sprint accomplishes.

#### Tasks
| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Task description | High/Med/Low | ⏳/🔄/✅ | - |

#### Files to Modify
\`\`\`
path/to/file.tsx
\`\`\`

#### Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

---

## Notes
*Add implementation notes here as the sprint progresses.*
```

## Status Legend

- ⏳ Pending / Not Started
- 🔄 In Progress
- ✅ Complete
- ❌ Blocked
- 🚫 Cancelled

## Priority Order

Based on dependencies and business value:

1. **Phase 1** - Foundation for all other phases
2. **Phase 2** - Strategies (core differentiator)
3. **Phase 3** - Dashboard (user experience)
4. **Phase 4** - Analytics (core value)
5. **Phase 5** - Trade Detail (polish)
6. **Phase 6** - Notebook (user experience)
7. **Phase 9.1** - CSV Parsers (can be done in parallel)
8. **Phase 7** - Trade Replay (advanced)
9. **Phase 8** - Backtesting (advanced)
10. **Phase 10** - Mobile (polish)
11. **Phase 11** - Social (future)

