# Phase 2: Strategy System

> **Parent:** [../ROADMAP.md](../ROADMAP.md)
>
> **Priority:** HIGH | **Dependencies:** Phase 1 | **Estimate:** 2 weeks
>
> **Status:** 🔄 In Progress

---

## Overview

Document and track trading strategies with clear rules. Each strategy defines entry criteria, exit rules, position sizing, and risk parameters. Trades can be linked to strategies to track compliance and performance.

---

## Sprint Breakdown

### Sprint 2.1: Strategy Data Model

**Goal:** Create the database schema for strategies and rules.

#### Tasks

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Design strategies table schema | High | ✅ | - |
| Design strategy_rules table schema | High | ✅ | - |
| Add strategyId to trades table | High | ✅ | - |
| Create Drizzle schema definitions | High | ✅ | - |
| Create migration | High | ✅ | - |
| Add strategy relations | High | ✅ | - |

---

### Sprint 2.2: Strategy CRUD Pages

**Goal:** Create pages to manage strategies.

#### Tasks

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Create `/strategies` listing page | High | ✅ | - |
| Create strategy card component | High | ✅ | - |
| Create `/strategies/new` page | High | ✅ | - |
| Create strategy form component | High | ✅ | - |
| Create `/strategies/[id]` detail page | High | ✅ | - |
| Create strategies tRPC router | High | ✅ | - |
| Add rules management (add/edit/delete/reorder) | High | ✅ | - |

---

### Sprint 2.3: Trade-Strategy Integration

**Goal:** Link trades to strategies and track rule compliance.

#### Tasks

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Add Strategy tab to trade detail page | High | ✅ | - |
| Create strategy assignment dropdown | High | ✅ | - |
| Display strategy rules as checkboxes | High | ✅ | - |
| Store rule compliance in DB | High | ✅ | - |
| Calculate compliance percentage | Medium | ✅ | - |
| Quick strategy assignment in trade log | Medium | ⏳ | - |

---

### Sprint 2.4: Strategy Analytics

**Goal:** Show performance metrics per strategy.

#### Tasks

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Calculate stats per strategy | High | ⏳ | - |
| Win rate by strategy | High | ⏳ | - |
| Profit factor by strategy | High | ⏳ | - |
| Average R per strategy | Medium | ⏳ | - |
| Strategy comparison chart | Medium | ⏳ | - |
| Add strategy stats to `/strategies/[id]` | High | ⏳ | - |

---

## Database Schema

```sql
CREATE TABLE strategies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  entry_criteria TEXT,
  exit_rules TEXT,
  position_sizing TEXT,
  risk_parameters TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE TABLE strategy_rules (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trade_rule_check (
  trade_id INTEGER NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  rule_id INTEGER NOT NULL REFERENCES strategy_rules(id) ON DELETE CASCADE,
  checked BOOLEAN DEFAULT false,
  checked_at TIMESTAMP,
  PRIMARY KEY (trade_id, rule_id)
);

ALTER TABLE trades ADD COLUMN strategy_id INTEGER REFERENCES strategies(id);
```

---

## Files Created

```
src/app/(protected)/strategies/
├── page.tsx                    # Strategy listing
├── new/
│   └── page.tsx               # Create strategy
├── [id]/
│   └── page.tsx               # Strategy detail/edit

src/components/strategy/
├── index.ts                    # Barrel exports
├── strategy-card.tsx           # Card for listing
├── strategy-form.tsx           # Create/edit form
├── compliance-badge.tsx        # Compliance indicator
├── risk-config.tsx             # Risk parameters form
├── scaling-config.tsx          # Scaling rules form
├── trailing-config.tsx         # Trailing stop form
└── rule-checklist.tsx          # Rules checklist on trade

src/server/api/routers/strategies.ts  # tRPC router
```

---

## Notes

- Renamed from "Playbook" to "Strategy" for cleaner terminology
- Database migration `0007_rename_playbook_to_strategy.sql` handles the rename
- All UI references updated from "Playbook" to "Strategy"

