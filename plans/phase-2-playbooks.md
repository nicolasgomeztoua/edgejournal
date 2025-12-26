# Phase 2: Playbook System

> **Parent:** [../ROADMAP.md](../ROADMAP.md)
>
> **Priority:** HIGH | **Dependencies:** Phase 1 | **Estimate:** 2 weeks
>
> **Status:** ⏳ Not Started

---

## Overview

Document and track trading strategies with clear rules. Each playbook defines entry criteria, exit rules, position sizing, and risk parameters. Trades can be linked to playbooks to track compliance and performance.

---

## Sprint Breakdown

### Sprint 2.1: Playbook Data Model

**Goal:** Create the database schema for playbooks and rules.

#### Tasks

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Design playbooks table schema | High | ⏳ | - |
| Design playbook_rules table schema | High | ⏳ | - |
| Add playbookId to trades table | High | ⏳ | - |
| Create Drizzle schema definitions | High | ⏳ | - |
| Create migration | High | ⏳ | - |
| Add playbook relations | High | ⏳ | - |

---

### Sprint 2.2: Playbook CRUD Pages

**Goal:** Create pages to manage playbooks.

#### Tasks

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Create `/playbooks` listing page | High | ⏳ | - |
| Create playbook card component | High | ⏳ | - |
| Create `/playbooks/new` page | High | ⏳ | - |
| Create playbook form component | High | ⏳ | - |
| Create `/playbooks/[id]` detail page | High | ⏳ | - |
| Create playbooks tRPC router | High | ⏳ | - |
| Add rules management (add/edit/delete/reorder) | High | ⏳ | - |

---

### Sprint 2.3: Trade-Playbook Integration

**Goal:** Link trades to playbooks and track rule compliance.

#### Tasks

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Add Playbook tab to trade detail page | High | ⏳ | - |
| Create playbook assignment dropdown | High | ⏳ | - |
| Display playbook rules as checkboxes | High | ⏳ | - |
| Store rule compliance in DB | High | ⏳ | - |
| Calculate compliance percentage | Medium | ⏳ | - |
| Quick playbook assignment in trade log | Medium | ⏳ | - |

---

### Sprint 2.4: Playbook Analytics

**Goal:** Show performance metrics per playbook.

#### Tasks

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Calculate stats per playbook | High | ⏳ | - |
| Win rate by playbook | High | ⏳ | - |
| Profit factor by playbook | High | ⏳ | - |
| Average R per playbook | Medium | ⏳ | - |
| Playbook comparison chart | Medium | ⏳ | - |
| Add playbook stats to `/playbooks/[id]` | High | ⏳ | - |

---

## Database Schema

```sql
CREATE TABLE playbooks (
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

CREATE TABLE playbook_rules (
  id SERIAL PRIMARY KEY,
  playbook_id INTEGER NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trade_playbook_compliance (
  trade_id INTEGER NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  rule_id INTEGER NOT NULL REFERENCES playbook_rules(id) ON DELETE CASCADE,
  is_checked BOOLEAN DEFAULT false,
  PRIMARY KEY (trade_id, rule_id)
);

ALTER TABLE trades ADD COLUMN playbook_id INTEGER REFERENCES playbooks(id);
```

---

## Files to Create

```
src/app/(protected)/playbooks/
├── page.tsx                    # Playbook listing
├── new/
│   └── page.tsx               # Create playbook
├── [id]/
│   └── page.tsx               # Playbook detail/edit
└── _components/
    ├── playbook-card.tsx      # Card for listing
    ├── playbook-form.tsx      # Create/edit form
    └── rules-editor.tsx       # Rules CRUD

src/server/api/routers/playbooks.ts  # tRPC router
```

---

## Notes

*Add implementation notes here as the sprint progresses.*

