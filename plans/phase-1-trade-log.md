# Phase 1: Enhanced Trade Log and Filtering

> **Parent:** [../ROADMAP.md](../ROADMAP.md)
>
> **Priority:** HIGH | **Dependencies:** None | **Estimate:** 2-3 weeks
>
> **Status:** ⏳ Not Started

---

## Overview

Make the trade log more powerful and customizable like TradeZella's, with customizable columns, ratings, review status, and advanced filtering.

---

## Sprint Breakdown

### Sprint 1.1: Customizable Trade Log Columns (3-4 days)

**Goal:** Allow users to show/hide and reorder columns in the trade log.

#### Tasks

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Create column config type with all available columns | High | ⏳ | - |
| Add `tradeLogColumns` JSON field to user_settings | High | ⏳ | - |
| Build column visibility dropdown component | High | ⏳ | - |
| Implement column visibility toggle logic | High | ⏳ | - |
| Add drag-and-drop column reordering | Medium | ⏳ | - |
| Persist column preferences to DB | High | ⏳ | - |
| Add "Reset to default" option | Low | ⏳ | - |

#### Files to Modify

```
src/server/db/schema.ts              # Add tradeLogColumns to user_settings
src/server/api/routers/settings.ts   # Add column preferences mutation
src/app/(protected)/journal/page.tsx # Column visibility UI
src/components/ui/column-toggle.tsx  # New component
```

#### Acceptance Criteria

- [ ] Users can show/hide any column from a dropdown
- [ ] Column preferences persist across sessions
- [ ] Users can reorder columns via drag-and-drop
- [ ] Default column set is sensible

---

### Sprint 1.2: Trade Rating System (2-3 days)

**Goal:** Allow users to rate trades 1-5 stars for later analysis.

#### Tasks

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Add `rating` field to trades table | High | ⏳ | - |
| Create DB migration | High | ⏳ | - |
| Build star rating component | High | ⏳ | - |
| Add rating to trade detail page | High | ⏳ | - |
| Add inline rating in trade log | Medium | ⏳ | - |
| Update trades router for rating mutations | High | ⏳ | - |
| Add rating filter to journal | Medium | ⏳ | - |

#### Files to Modify

```
src/server/db/schema.ts                    # Add rating field
drizzle/XXXX_add_trade_rating.sql          # Migration
src/components/ui/star-rating.tsx          # New component
src/app/(protected)/journal/[id]/page.tsx  # Rating on detail
src/app/(protected)/journal/page.tsx       # Rating in table
src/server/api/routers/trades.ts           # Rating mutations
```

#### Database Migration

```sql
ALTER TABLE trade ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
CREATE INDEX trade_rating_idx ON trade(rating);
```

#### Acceptance Criteria

- [ ] Users can rate trades 1-5 stars
- [ ] Rating is visible in trade log
- [ ] Rating is editable on trade detail page
- [ ] Can filter trades by rating

---

### Sprint 1.3: Trade Review Status (1-2 days)

**Goal:** Track which trades have been reviewed by the user.

#### Tasks

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Add `isReviewed` boolean to trades table | High | ⏳ | - |
| Create DB migration | High | ⏳ | - |
| Add "Mark as reviewed" button on trade detail | High | ⏳ | - |
| Add reviewed badge/icon in trade log | Medium | ⏳ | - |
| Add reviewed/unreviewed filter | Medium | ⏳ | - |
| Bulk "mark as reviewed" action | Low | ⏳ | - |

#### Files to Modify

```
src/server/db/schema.ts                    # Add isReviewed field
drizzle/XXXX_add_trade_review.sql          # Migration
src/app/(protected)/journal/[id]/page.tsx  # Review button
src/app/(protected)/journal/page.tsx       # Filter + badge
src/server/api/routers/trades.ts           # Review mutations
```

#### Acceptance Criteria

- [ ] Users can mark trades as reviewed
- [ ] Reviewed trades show visual indicator
- [ ] Can filter by reviewed status

---

### Sprint 1.4: Advanced Filter Panel (3-4 days)

**Goal:** Create a comprehensive filter panel like TradeZella's.

#### Tasks

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Design filter panel UI (drawer or modal) | High | ⏳ | - |
| Create FilterPanel component | High | ⏳ | - |
| Implement date range picker | High | ⏳ | - |
| Add day of week filter (checkboxes) | High | ⏳ | - |
| Add time of day filter (range) | Medium | ⏳ | - |
| Add trade duration filter | Medium | ⏳ | - |
| Add month filter | Medium | ⏳ | - |
| Create filter_presets table | Medium | ⏳ | - |
| Save/load filter presets | Medium | ⏳ | - |
| "Clear all filters" button | High | ⏳ | - |
| Active filter count badge | Medium | ⏳ | - |

#### New Components

```
src/app/(protected)/journal/_components/
├── filter-panel.tsx          # Main filter drawer/modal
├── date-range-picker.tsx     # Date range selector
├── day-of-week-filter.tsx    # Day checkboxes
├── time-range-filter.tsx     # Time slider
└── filter-preset-select.tsx  # Saved presets dropdown
```

#### Database Changes

```sql
CREATE TABLE filter_presets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Acceptance Criteria

- [ ] Filter panel opens as drawer/modal
- [ ] Can filter by date range
- [ ] Can filter by day of week
- [ ] Can filter by time of day
- [ ] Can filter by trade duration
- [ ] Can save filter presets
- [ ] Can load saved presets
- [ ] Clear all filters works

---

### Sprint 1.5: Tags System Enhancement (2-3 days)

**Goal:** Make the existing tags system fully functional.

#### Tasks

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Create tag management UI (settings or modal) | High | ⏳ | - |
| Add tag CRUD operations | High | ⏳ | - |
| Multi-tag assignment on trade detail | High | ⏳ | - |
| Tag picker with autocomplete | High | ⏳ | - |
| Display tags in trade log | Medium | ⏳ | - |
| Filter by tags in filter panel | High | ⏳ | - |
| Tag colors UI | Medium | ⏳ | - |
| Bulk tag assignment | Low | ⏳ | - |

#### Files to Modify

```
src/server/api/routers/tags.ts              # Create if missing
src/app/(protected)/settings/page.tsx       # Tag management
src/app/(protected)/journal/[id]/page.tsx   # Tag picker
src/app/(protected)/journal/page.tsx        # Tags display + filter
src/components/ui/tag-picker.tsx            # New component
```

#### Acceptance Criteria

- [ ] Can create/edit/delete tags
- [ ] Can assign multiple tags to a trade
- [ ] Tags display in trade log
- [ ] Can filter by tags
- [ ] Tags have customizable colors

---

## Technical Notes

### Filter State Management

Consider using URL search params for filter state so filters are shareable/bookmarkable:

```typescript
// Example URL
/journal?status=closed&direction=long&rating=4,5&from=2024-01-01&to=2024-12-31

// Use nuqs or next/navigation useSearchParams
```

### Column Configuration Type

```typescript
interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  width?: number;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'symbol', label: 'Symbol', visible: true, order: 0 },
  { id: 'direction', label: 'Side', visible: true, order: 1 },
  { id: 'entryPrice', label: 'Entry', visible: true, order: 2 },
  // ...
];
```

---

## Definition of Done

- [ ] All tasks completed
- [ ] Tests written for new functionality
- [ ] No regressions in existing features
- [ ] Mobile responsive
- [ ] Follows The Terminal design system
- [ ] Code reviewed and merged

---

## Notes

*Add implementation notes, decisions, and learnings here as the sprint progresses.*

