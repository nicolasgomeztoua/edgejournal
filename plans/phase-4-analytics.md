# Phase 4: Advanced Analytics

> **Parent:** [../ROADMAP.md](../ROADMAP.md)
>
> **Priority:** HIGH | **Dependencies:** Phase 1, 2 | **Estimate:** 4-5 weeks
>
> **Status:** 🔄 In Progress

---

## Overview

Transform EdgeJournal's analytics from basic charts into a professional-grade performance analysis system. Combines TradeZella's 50+ report categories with institutional metrics used by hedge funds and prop firms: Sharpe/Sortino/Calmar ratios, Risk of Ruin, MAE/MFE analysis, Kelly Criterion, and Monte Carlo simulations.

---

## Professional Metrics Reference

### Risk-Adjusted Return Metrics

| Metric | Formula | Purpose |
|--------|---------|---------|
| Sharpe Ratio | (Return - RiskFree) / StdDev | Overall risk-adjusted performance |
| Sortino Ratio | (Return - RiskFree) / DownsideStdDev | Penalizes only downside volatility |
| Calmar Ratio | Annualized Return / Max Drawdown | Return per unit of drawdown risk |

### Risk Management Metrics

| Metric | Formula | Purpose |
|--------|---------|---------|
| Risk of Ruin | Probability calculation | Chance of blowing account |
| Kelly Criterion | (W × AvgWin - L × AvgLoss) / AvgWin | Optimal position size % |
| Recovery Factor | Net Profit / Max Drawdown | How efficiently you recover |
| Ulcer Index | RMS of drawdown percentages | Drawdown depth + duration |

### Trade Quality Metrics

| Metric | Formula | Purpose |
|--------|---------|---------|
| MAE | Max Adverse Excursion | Optimize stop loss placement |
| MFE | Max Favorable Excursion | Optimize take profit placement |
| Trade Efficiency | Actual P&L / MFE | % of available move captured |
| Expectancy | (Win% × AvgWin) - (Loss% × AvgLoss) | Expected $ per trade |

---

## Sprint Breakdown

### Sprint 4.1: Infrastructure and Core Metrics (Week 1)

**Goal:** Set up analytics router, extend stats calculations, build reusable chart components, add tab navigation.

#### Tasks

| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| Create `src/server/api/routers/analytics.ts` router | High | ✅ | New router for all analytics |
| Add analytics router to `root.ts` | High | ✅ | Register in tRPC |
| Create `getOverview` procedure | High | ✅ | All core metrics in one call |
| Extend `stats-calculations.ts` with Sharpe/Sortino | High | ✅ | Risk-adjusted returns |
| Add expectancy and payoff ratio calculations | High | ✅ | Trade quality metrics |
| Add standard deviation helpers | Medium | ✅ | Required for ratios |
| Refactor analytics page with tab navigation | High | ✅ | Overview, Time, Risk, Symbol, Behavior tabs |
| Create `MetricCard` component with tooltip | High | ✅ | **REQUIRED: Every metric needs tooltip with what/why/benchmark** |
| Create `DistributionChart` component | Medium | ⏳ | For histograms |
| Style tabs following Terminal design | Medium | ✅ | Consistent with app |

#### Files to Create

```
src/server/api/routers/analytics.ts        # New analytics router
src/components/analytics/metric-card.tsx   # Metric display with info tooltip
src/components/analytics/distribution-chart.tsx  # Histogram component
src/components/analytics/index.ts          # Barrel export
```

#### Files to Modify

```
src/server/api/root.ts                     # Add analytics router
src/lib/stats-calculations.ts              # Add new calculations
src/app/(protected)/analytics/page.tsx     # Refactor with tabs
```

#### Acceptance Criteria

- [ ] Analytics page has 5 tabs: Overview, Time, Risk, Symbols, Behavior
- [ ] Overview tab shows all existing metrics plus Expectancy, Payoff Ratio
- [ ] MetricCard component shows info icon with tooltip explaining the metric
- [ ] All calculations have unit tests
- [ ] Page loads in under 2 seconds with 500+ trades

---

### Sprint 4.2: Time-Based Analysis (Week 2)

**Goal:** Performance breakdowns by day of week, hour of day, month, and trading session.

#### Tasks

| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| Create `getPerformanceByDayOfWeek` procedure | High | ⏳ | P&L, win rate per day |
| Create `getPerformanceByHour` procedure | High | ⏳ | Respect user timezone |
| Create `getPerformanceByMonth` procedure | High | ⏳ | Monthly comparison |
| Create `getPerformanceBySession` procedure | Medium | ⏳ | Asia/London/NY |
| Create `getCalendarData` procedure | High | ⏳ | Daily P&L for heatmap |
| Build `CalendarHeatmap` component | High | ⏳ | GitHub-style, clickable |
| Build `DayOfWeekChart` component | High | ⏳ | Bar chart by weekday |
| Build `HourHeatmap` component | Medium | ⏳ | 24-hour grid |
| Build `SessionChart` component | Medium | ⏳ | Session breakdown |
| Build `MonthlyChart` component | Medium | ⏳ | Month-over-month |
| Implement Time tab UI | High | ⏳ | Layout and styling |

#### Files to Create

```
src/components/analytics/calendar-heatmap.tsx  # GitHub-style calendar
src/components/analytics/day-of-week-chart.tsx # Weekday performance
src/components/analytics/hour-heatmap.tsx      # Hour-by-hour grid
src/components/analytics/session-chart.tsx     # Trading sessions
src/components/analytics/monthly-chart.tsx     # Monthly comparison
```

#### Files to Modify

```
src/server/api/routers/analytics.ts   # Add time procedures
src/app/(protected)/analytics/page.tsx # Time tab content
```

#### Trading Sessions Configuration

```typescript
const TRADING_SESSIONS = {
  asia: { start: 0, end: 8 },      // 00:00 - 08:00 UTC
  london: { start: 8, end: 16 },   // 08:00 - 16:00 UTC
  newYork: { start: 13, end: 21 }, // 13:00 - 21:00 UTC
};
```

#### Acceptance Criteria

- [ ] Calendar heatmap shows daily P&L with color intensity
- [ ] Clicking a calendar day shows trades for that day
- [ ] Day of week chart identifies best/worst trading days
- [ ] Hour analysis respects user's timezone setting
- [ ] Session analysis works for both futures and forex
- [ ] All charts follow Terminal design system

---

### Sprint 4.3: Risk Metrics (Week 3)

**Goal:** Professional risk analytics - drawdown tracking, risk-adjusted returns, risk of ruin.

#### Tasks

| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| Create `src/lib/risk-calculations.ts` | High | ⏳ | All risk formulas |
| Implement `calculateDrawdowns` function | High | ⏳ | Find all drawdown periods |
| Implement `calculateSharpeRatio` function | High | ⏳ | Daily returns-based |
| Implement `calculateSortinoRatio` function | High | ⏳ | Downside deviation only |
| Implement `calculateCalmarRatio` function | Medium | ⏳ | Annualized return / MDD |
| Implement `calculateRiskOfRuin` function | High | ⏳ | Probability formula |
| Implement `calculateKellyCriterion` function | High | ⏳ | Optimal sizing |
| Implement `calculateUlcerIndex` function | Low | ⏳ | RMS of drawdowns |
| Implement `calculateRecoveryFactor` function | Medium | ⏳ | Net profit / MDD |
| Create `getRiskMetrics` procedure | High | ⏳ | Return all risk data |
| Create `getDrawdownHistory` procedure | High | ⏳ | For drawdown table |
| Build `EquityCurve` component | High | ⏳ | With drawdown highlighting |
| Build `DrawdownTable` component | High | ⏳ | Top 10 drawdowns |
| Build `RiskOfRuinGauge` component | Medium | ⏳ | Visual probability |
| Build `KellyDisplay` component | Medium | ⏳ | Position size recommendation |
| Implement Risk tab UI | High | ⏳ | Layout all components |

#### Files to Create

```
src/lib/risk-calculations.ts               # Risk metric calculations
src/components/analytics/equity-curve.tsx  # Equity with drawdowns
src/components/analytics/drawdown-table.tsx # Top drawdowns list
src/components/analytics/risk-gauge.tsx    # Risk of ruin visualization
src/components/analytics/kelly-display.tsx # Kelly recommendation
```

#### Files to Modify

```
src/server/api/routers/analytics.ts   # Add risk procedures
src/app/(protected)/analytics/page.tsx # Risk tab content
```

#### Risk of Ruin Formula

```typescript
// Simplified Risk of Ruin formula
// RoR = ((1 - Edge) / (1 + Edge))^Units
// Where Edge = (WinRate * PayoffRatio - LossRate) / PayoffRatio
function calculateRiskOfRuin(
  winRate: number,      // e.g., 0.55
  payoffRatio: number,  // avgWin / avgLoss, e.g., 1.5
  riskPerTrade: number, // % of capital risked, e.g., 0.02
  ruinThreshold: number // e.g., 0.5 for 50% drawdown
): number
```

#### Acceptance Criteria

- [ ] Equity curve clearly shows drawdown periods in red
- [ ] Drawdown table shows depth, duration, and recovery time
- [ ] Risk of Ruin displays as percentage with visual gauge
- [ ] Kelly Criterion shows recommended position size %
- [ ] Sharpe/Sortino/Calmar displayed with industry benchmarks
- [ ] All calculations match standard financial formulas

---

### Sprint 4.4: Symbol and Setup Analysis (Week 4)

**Goal:** Performance breakdown by symbol, setup type, strategy, and direction.

#### Tasks

| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| Create `getSymbolPerformance` procedure | High | ⏳ | Stats grouped by symbol |
| Create `getSetupPerformance` procedure | High | ⏳ | Stats by setup type |
| Create `getDirectionPerformance` procedure | Medium | ⏳ | Long vs Short |
| Create `getInstrumentTypePerformance` procedure | Medium | ⏳ | Futures vs Forex |
| Create `getStrategyComparison` procedure | High | ⏳ | Compare strategies |
| Build `PerformanceTable` component | High | ⏳ | Sortable, filterable |
| Build `ComparisonChart` component | High | ⏳ | Multi-series bars |
| Build `SymbolBreakdown` component | Medium | ⏳ | Pie/donut chart |
| Build `DirectionComparison` component | Medium | ⏳ | Long vs Short visual |
| Implement Symbol tab UI | High | ⏳ | Layout components |

#### Files to Create

```
src/components/analytics/performance-table.tsx  # Sortable stats table
src/components/analytics/comparison-chart.tsx   # Multi-series comparison
src/components/analytics/symbol-breakdown.tsx   # Symbol distribution
src/components/analytics/direction-comparison.tsx # Long vs Short
```

#### Files to Modify

```
src/server/api/routers/analytics.ts   # Add symbol procedures
src/app/(protected)/analytics/page.tsx # Symbol tab content
```

#### Performance Table Columns

```typescript
const PERFORMANCE_TABLE_COLUMNS = [
  'name',        // Symbol, Setup, or Strategy name
  'trades',      // Total trade count
  'winRate',     // Win rate %
  'totalPnl',    // Net P&L
  'avgPnl',      // Average P&L per trade
  'profitFactor',// Profit factor
  'avgWin',      // Average winning trade
  'avgLoss',     // Average losing trade
  'expectancy',  // Expected value per trade
];
```

#### Acceptance Criteria

- [ ] Performance table is sortable by any column
- [ ] Can compare up to 5 symbols/strategies side-by-side
- [ ] Direction analysis shows Long vs Short clearly
- [ ] Setup type analysis works with user-defined setups
- [ ] Strategy comparison links to strategy detail pages
- [ ] Top performers highlighted visually

---

### Sprint 4.5: Behavioral Patterns and Streaks (Week 4-5)

**Goal:** Identify behavioral patterns, streaks, and psychological tendencies.

#### Tasks

| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| Create `getStreakAnalysis` procedure | High | ⏳ | Win/loss streaks |
| Create `getAfterWinPerformance` procedure | High | ⏳ | Performance after wins |
| Create `getAfterLossPerformance` procedure | High | ⏳ | Revenge trading detection |
| Create `getOvertradingAnalysis` procedure | Medium | ⏳ | Trade count vs P&L |
| Create `getHoldDurationAnalysis` procedure | Medium | ⏳ | Duration vs P&L |
| Create `getPositionSizeAnalysis` procedure | Medium | ⏳ | Size vs performance |
| Build `StreakCard` component | High | ⏳ | Current + longest streaks |
| Build `AfterWinLossChart` component | High | ⏳ | Before/after comparison |
| Build `CorrelationChart` component | Medium | ⏳ | Scatter plot with trend |
| Build `OvertradingWarning` component | Medium | ⏳ | Alert if pattern detected |
| Implement Behavior tab UI | High | ⏳ | Layout components |

#### Files to Create

```
src/components/analytics/streak-card.tsx        # Win/loss streak display
src/components/analytics/after-win-loss.tsx     # Performance patterns
src/components/analytics/correlation-chart.tsx  # X vs Y scatter
src/components/analytics/overtrading-warning.tsx # Behavioral alert
```

#### Files to Modify

```
src/server/api/routers/analytics.ts   # Add behavior procedures
src/app/(protected)/analytics/page.tsx # Behavior tab content
```

#### Streak Analysis Schema

```typescript
interface StreakAnalysis {
  currentStreak: {
    type: 'win' | 'loss' | 'none';
    count: number;
  };
  longestWinStreak: {
    count: number;
    startDate: Date;
    endDate: Date;
    totalPnl: number;
  };
  longestLossStreak: {
    count: number;
    startDate: Date;
    endDate: Date;
    totalPnl: number;
  };
  averageWinStreak: number;
  averageLossStreak: number;
}
```

#### Overtrading Detection Logic

```typescript
// Flag overtrading if:
// 1. Days with 5+ trades have lower avg P&L than days with 1-3 trades
// 2. Win rate decreases as daily trade count increases
// 3. Performance degrades in latter half of session
```

#### Acceptance Criteria

- [ ] Current streak prominently displayed
- [ ] Longest win/loss streaks shown with dates and P&L
- [ ] After-win performance clearly shows if user maintains edge
- [ ] After-loss performance reveals revenge trading patterns
- [ ] Overtrading warning triggers when pattern detected
- [ ] Hold duration analysis buckets trades appropriately

---

### Sprint 4.6: MAE/MFE and Monte Carlo (Week 5)

**Goal:** Advanced trade quality analysis with MAE/MFE and Monte Carlo simulations.

#### Tasks

| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| Evaluate data requirements for MAE/MFE | High | ⏳ | Need high/low during trade |
| Option A: Add `tradeHigh`/`tradeLow` to schema | Medium | ⏳ | Manual entry option |
| Option B: Integrate market data API | Low | ⏳ | Auto-fetch historical |
| Create `getMAEMFEAnalysis` procedure | High | ⏳ | Requires price data |
| Create `getTradeEfficiency` procedure | High | ⏳ | Actual / MFE |
| Implement Monte Carlo simulation | High | ⏳ | Randomize trade order |
| Create `runMonteCarloSimulation` procedure | High | ⏳ | N iterations |
| Build `MAEMFEScatter` component | High | ⏳ | MAE vs MFE plot |
| Build `EfficiencyHistogram` component | Medium | ⏳ | Distribution chart |
| Build `MonteCarloChart` component | High | ⏳ | Outcome distribution |
| Build `OptimizationSuggestions` component | Medium | ⏳ | SL/TP recommendations |
| Add MAE/MFE section to analytics | High | ⏳ | Part of Risk or separate |

#### Files to Create

```
src/components/analytics/mae-mfe-scatter.tsx    # MAE vs MFE scatter plot
src/components/analytics/efficiency-histogram.tsx # Trade efficiency dist
src/components/analytics/monte-carlo.tsx        # Simulation results
src/components/analytics/optimization-tips.tsx  # SL/TP suggestions
```

#### Files to Modify

```
src/server/db/schema.ts              # Potentially add tradeHigh/tradeLow
src/lib/risk-calculations.ts         # Add Monte Carlo logic
src/server/api/routers/analytics.ts  # Add MAE/MFE procedures
src/app/(protected)/analytics/page.tsx # MAE/MFE UI
```

#### Monte Carlo Implementation

```typescript
interface MonteCarloResult {
  iterations: number;
  percentiles: {
    p5: number;   // 5th percentile (worst likely outcome)
    p25: number;  // 25th percentile
    p50: number;  // Median outcome
    p75: number;  // 75th percentile
    p95: number;  // 95th percentile (best likely outcome)
  };
  probabilityOfProfit: number;  // % of simulations that were profitable
  probabilityOfRuin: number;    // % that hit drawdown threshold
  expectedValue: number;        // Mean final equity
  standardDeviation: number;    // Volatility of outcomes
}

function runMonteCarloSimulation(
  trades: Trade[],
  iterations: number = 1000,
  initialEquity: number,
  ruinThreshold: number = 0.5
): MonteCarloResult
```

#### Schema Changes (Optional)

```sql
-- Option A: Store trade high/low for MAE/MFE
ALTER TABLE trade ADD COLUMN trade_high DECIMAL(20, 8);
ALTER TABLE trade ADD COLUMN trade_low DECIMAL(20, 8);

-- These can be:
-- 1. Manually entered by user
-- 2. Auto-populated from market data on import
-- 3. Fetched lazily when viewing MAE/MFE analysis
```

#### Acceptance Criteria

- [ ] MAE/MFE scatter plot shows trade quality visually
- [ ] Trade efficiency histogram identifies optimization opportunities
- [ ] Monte Carlo runs 1000 iterations in under 3 seconds
- [ ] Monte Carlo shows probability distribution of outcomes
- [ ] Optimization suggestions based on MAE/MFE data
- [ ] Works gracefully when trade high/low data unavailable

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Analytics Page                               │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐           │
│  │Overview │  Time   │  Risk   │ Symbols │Behavior │           │
│  └────┬────┴────┬────┴────┬────┴────┬────┴────┬────┘           │
└───────┼─────────┼─────────┼─────────┼─────────┼─────────────────┘
        │         │         │         │         │
        ▼         ▼         ▼         ▼         ▼
┌───────────────────────────────────────────────────────────────┐
│                    analytics.ts Router                         │
│  ┌──────────────┬──────────────┬──────────────┬─────────────┐ │
│  │ getOverview  │getTimeAnalysis│getRiskMetrics│getSymbol... │ │
│  └──────┬───────┴──────┬───────┴──────┬───────┴──────┬──────┘ │
└─────────┼──────────────┼──────────────┼──────────────┼────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
┌─────────────────┐ ┌─────────────────┐ ┌──────────────────────┐
│stats-calculations│ │risk-calculations│ │   Database (trades)  │
│   .ts           │ │      .ts        │ │                      │
└─────────────────┘ └─────────────────┘ └──────────────────────┘
```

---

## File Summary

### New Files (14 total)

```
src/server/api/routers/analytics.ts           # Main analytics router
src/lib/risk-calculations.ts                  # Risk metric formulas

src/components/analytics/
├── index.ts                                  # Barrel exports
├── metric-card.tsx                           # Metric with tooltip
├── distribution-chart.tsx                    # Histogram
├── calendar-heatmap.tsx                      # Daily P&L calendar
├── day-of-week-chart.tsx                     # Weekday performance
├── hour-heatmap.tsx                          # Hour grid
├── session-chart.tsx                         # Trading sessions
├── equity-curve.tsx                          # With drawdowns
├── drawdown-table.tsx                        # Top drawdowns
├── performance-table.tsx                     # Symbol/setup stats
├── streak-card.tsx                           # Win/loss streaks
├── monte-carlo.tsx                           # Simulation results
└── mae-mfe-scatter.tsx                       # MAE/MFE plot
```

### Modified Files

```
src/server/api/root.ts                        # Add analytics router
src/lib/stats-calculations.ts                 # Extend with new calcs
src/app/(protected)/analytics/page.tsx        # Complete refactor
src/server/db/schema.ts                       # Potentially add fields
```

---

## Success Criteria

- [ ] Analytics page loads in under 2 seconds with 1000+ trades
- [ ] All calculations match industry-standard formulas
- [ ] **Every metric has an info tooltip explaining what it means and why it matters**
- [ ] Mobile-responsive following Terminal design
- [ ] Charts use ag-charts-react consistent with existing
- [ ] Risk of Ruin and Kelly Criterion provide actionable insights
- [ ] Time analysis helps identify optimal trading windows
- [ ] Behavioral analysis reveals psychological patterns

---

## UX Requirement: Metric Tooltips

**Every analytic metric MUST have an info tooltip** with:
1. **What it is** — One-sentence definition
2. **Why it matters** — How traders use this metric
3. **Good vs Bad** — What values indicate strong/weak performance

Example for Sharpe Ratio:
```
What: Measures risk-adjusted return (excess return per unit of volatility)
Why: Higher Sharpe = better returns for the risk taken
Benchmark: >1 is good, >2 is excellent, <0 means losing money
```

Implementation: Use the `MetricCard` component with an info icon that shows a tooltip on hover.

---

## Notes

*Add implementation notes here as sprints progress.*

### Sprint 4.1 Notes
*(To be filled during implementation)*

### Sprint 4.2 Notes
*(To be filled during implementation)*

### Sprint 4.3 Notes
*(To be filled during implementation)*

### Sprint 4.4 Notes
*(To be filled during implementation)*

### Sprint 4.5 Notes
*(To be filled during implementation)*

### Sprint 4.6 Notes
*(To be filled during implementation)*
