"use client";

import { AgCharts } from "ag-charts-react";
import {
	Activity,
	BarChart3,
	Clock,
	PieChart,
	ShieldAlert,
	Target,
	TrendingUp,
	Zap,
} from "lucide-react";
import { useMemo } from "react";
import { MetricCard, METRIC_TOOLTIPS } from "@/components/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	formatCurrency,
	formatDate,
	formatPercent,
	getPnLColorClass,
} from "@/lib/utils";
import { api } from "@/trpc/react";

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function StatsOverview() {
	const { data: overview, isLoading } = api.analytics.getOverview.useQuery();

	if (isLoading) {
		return (
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{[...Array(8)].map((_, i) => (
					<div
						className="rounded border border-border bg-secondary p-4"
						key={`skeleton-stat-${i.toString()}`}
					>
						<Skeleton className="mb-3 h-3 w-16" />
						<Skeleton className="mb-2 h-6 w-24" />
						<Skeleton className="h-2 w-14" />
					</div>
				))}
			</div>
		);
	}

	if (!overview) return null;

	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{/* Row 1: Core metrics */}
			<MetricCard
				title="Total P&L"
				value={formatCurrency(overview.totalPnl)}
				description={`${overview.totalTrades} closed trades`}
				tooltip={METRIC_TOOLTIPS.totalPnl}
				icon={TrendingUp}
				colorClass={getPnLColorClass(overview.totalPnl)}
			/>
			<MetricCard
				title="Win Rate"
				value={formatPercent(overview.winRate, 1).replace("+", "")}
				description={`${overview.wins}W / ${overview.losses}L`}
				tooltip={METRIC_TOOLTIPS.winRate}
				icon={Target}
				colorClass={overview.winRate >= 50 ? "text-profit" : "text-loss"}
			/>
			<MetricCard
				title="Profit Factor"
				value={
					overview.profitFactor === Infinity
						? "∞"
						: overview.profitFactor.toFixed(2)
				}
				description="Gross profit / loss"
				tooltip={METRIC_TOOLTIPS.profitFactor}
				icon={BarChart3}
				colorClass={overview.profitFactor >= 1 ? "text-profit" : "text-loss"}
			/>
			<MetricCard
				title="Avg Trade"
				value={formatCurrency(overview.avgPnl)}
				description={`Avg win: ${formatCurrency(overview.avgWin)}`}
				tooltip={METRIC_TOOLTIPS.avgTrade}
				icon={PieChart}
				colorClass={getPnLColorClass(overview.avgPnl)}
			/>

			{/* Row 2: Advanced metrics */}
			<MetricCard
				title="Expectancy"
				value={formatCurrency(overview.expectancy)}
				description="Expected profit per trade"
				tooltip={METRIC_TOOLTIPS.expectancy}
				icon={Zap}
				colorClass={getPnLColorClass(overview.expectancy)}
			/>
			<MetricCard
				title="Payoff Ratio"
				value={
					overview.payoffRatio === Infinity
						? "∞"
						: overview.payoffRatio.toFixed(2)
				}
				description="Avg win / avg loss"
				tooltip={METRIC_TOOLTIPS.payoffRatio}
				icon={Activity}
				colorClass={overview.payoffRatio >= 1 ? "text-profit" : "text-loss"}
			/>
			<MetricCard
				title="Sharpe Ratio"
				value={overview.sharpeRatio.toFixed(2)}
				description="Risk-adjusted return"
				tooltip={METRIC_TOOLTIPS.sharpeRatio}
				icon={ShieldAlert}
				colorClass={
					overview.sharpeRatio >= 1
						? "text-profit"
						: overview.sharpeRatio >= 0
							? "text-breakeven"
							: "text-loss"
				}
			/>
			<MetricCard
				title="Current Streak"
				value={
					overview.currentStreakType === "none"
						? "—"
						: `${overview.currentStreak}${overview.currentStreakType === "win" ? "W" : "L"}`
				}
				description={
					overview.currentStreakType === "win"
						? "Consecutive wins"
						: overview.currentStreakType === "loss"
							? "Consecutive losses"
							: "No active streak"
				}
				tooltip={METRIC_TOOLTIPS.currentStreak}
				icon={TrendingUp}
				colorClass={
					overview.currentStreakType === "win"
						? "text-profit"
						: overview.currentStreakType === "loss"
							? "text-loss"
							: "text-muted-foreground"
				}
			/>
		</div>
	);
}

// =============================================================================
// CHARTS
// =============================================================================

function WinLossChart() {
	const { data: overview, isLoading } = api.analytics.getOverview.useQuery();

	const chartOptions = useMemo(() => {
		if (!overview) return {};

		return {
			background: { fill: "transparent" },
			data: [
				{ category: "Wins", value: overview.wins, color: "#00ff88" },
				{ category: "Losses", value: overview.losses, color: "#ff3b3b" },
				{ category: "Breakeven", value: overview.breakevens, color: "#fbbf24" },
			],
			series: [
				{
					type: "donut" as const,
					angleKey: "value",
					calloutLabelKey: "category",
					sectorLabelKey: "value",
					fills: ["#00ff88", "#ff3b3b", "#fbbf24"],
					innerRadiusRatio: 0.6,
				},
			],
			legend: {
				position: "bottom" as const,
				item: {
					label: {
						color: "#94a3b8",
						fontFamily: "JetBrains Mono, monospace",
						fontSize: 10,
					},
				},
			},
		};
	}, [overview]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full" />;
	}

	if (!overview || overview.totalTrades === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center font-mono text-muted-foreground text-xs">
				No trade data available
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

function PnLDistributionChart() {
	const { data, isLoading } = api.trades.getAll.useQuery({
		status: "closed",
		limit: 100,
	});

	const chartOptions = useMemo(() => {
		if (!data?.items) return {};

		const trades = data.items
			.filter((t) => t.netPnl)
			.map((t, i) => ({
				trade: i + 1,
				pnl: parseFloat(t.netPnl ?? "0"),
				color: parseFloat(t.netPnl ?? "0") >= 0 ? "#00ff88" : "#ff3b3b",
			}));

		return {
			background: { fill: "transparent" },
			data: trades.slice(0, 50),
			series: [
				{
					type: "bar" as const,
					xKey: "trade",
					yKey: "pnl",
					fill: "#00ff88",
					cornerRadius: 2,
					formatter: (params: { datum: { pnl: number } }) => ({
						fill: params.datum.pnl >= 0 ? "#00ff88" : "#ff3b3b",
					}),
				},
			],
			axes: [
				{
					type: "category" as const,
					position: "bottom" as const,
					label: {
						color: "#64748b",
						fontFamily: "JetBrains Mono, monospace",
						fontSize: 9,
					},
					line: { color: "#1e293b" },
				},
				{
					type: "number" as const,
					position: "left" as const,
					label: {
						color: "#64748b",
						fontFamily: "JetBrains Mono, monospace",
						fontSize: 9,
						formatter: (params: { value: number }) => `$${params.value}`,
					},
					line: { color: "#1e293b" },
					gridLine: { style: [{ stroke: "#ffffff08" }] },
				},
			],
		};
	}, [data]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full" />;
	}

	if (!data?.items || data.items.length === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center font-mono text-muted-foreground text-xs">
				No trade data available
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

function CumulativePnLChart() {
	const { data, isLoading } = api.trades.getAll.useQuery({
		status: "closed",
		limit: 100,
	});

	const chartOptions = useMemo(() => {
		if (!data?.items) return {};

		let cumulative = 0;
		const trades = data.items
			.filter((t) => t.netPnl)
			.reverse()
			.map((t, i) => {
				cumulative += parseFloat(t.netPnl ?? "0");
				return {
					trade: i + 1,
					pnl: cumulative,
					date: t.exitTime ? formatDate(t.exitTime) : "",
				};
			});

		return {
			background: { fill: "transparent" },
			data: trades,
			series: [
				{
					type: "area" as const,
					xKey: "trade",
					yKey: "pnl",
					fill: "#00ff8820",
					stroke: "#00ff88",
					strokeWidth: 2,
					marker: { enabled: false },
				},
			],
			axes: [
				{
					type: "category" as const,
					position: "bottom" as const,
					label: {
						color: "#64748b",
						fontFamily: "JetBrains Mono, monospace",
						fontSize: 9,
					},
					line: { color: "#1e293b" },
				},
				{
					type: "number" as const,
					position: "left" as const,
					label: {
						color: "#64748b",
						fontFamily: "JetBrains Mono, monospace",
						fontSize: 9,
						formatter: (params: { value: number }) => `$${params.value}`,
					},
					line: { color: "#1e293b" },
					gridLine: { style: [{ stroke: "#ffffff08" }] },
				},
			],
		};
	}, [data]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full" />;
	}

	if (!data?.items || data.items.length === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center font-mono text-muted-foreground text-xs">
				No trade data available
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

// =============================================================================
// TERMINAL WRAPPER
// =============================================================================

function ChartTerminal({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<div className="overflow-hidden rounded border border-border bg-card">
			{/* Terminal header */}
			<div className="flex items-center justify-between border-border border-b bg-secondary px-4 py-2">
				<div className="flex items-center gap-2">
					<div className="h-2.5 w-2.5 rounded-full bg-loss/60" />
					<div className="h-2.5 w-2.5 rounded-full bg-breakeven/60" />
					<div className="h-2.5 w-2.5 rounded-full bg-profit/60" />
				</div>
				<div className="text-center">
					<span className="font-mono text-[10px] text-muted-foreground">
						{title.toLowerCase().replace(/\s+/g, "-")}
					</span>
				</div>
				<div className="w-14" />
			</div>
			{/* Chart header */}
			<div className="border-border border-b px-4 py-3">
				<h3 className="font-medium text-sm">{title}</h3>
				<p className="font-mono text-[10px] text-muted-foreground">
					{description}
				</p>
			</div>
			{/* Chart content */}
			<div className="p-4">{children}</div>
		</div>
	);
}

// =============================================================================
// PLACEHOLDER TABS
// =============================================================================

function PlaceholderTab({ title }: { title: string }) {
	return (
		<div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded border border-border border-dashed bg-card/50">
			<Clock className="h-12 w-12 text-muted-foreground/30" />
			<div className="text-center">
				<h3 className="font-medium text-muted-foreground">{title} Analysis</h3>
				<p className="font-mono text-muted-foreground/60 text-xs">
					Coming in Sprint 4.2+
				</p>
			</div>
		</div>
	);
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function AnalyticsPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<span className="mb-2 block font-mono text-primary text-xs uppercase tracking-wider">
					Performance
				</span>
				<h1 className="font-bold text-3xl tracking-tight">Analytics</h1>
				<p className="mt-1 font-mono text-muted-foreground text-sm">
					Analyze your trading performance with professional metrics
				</p>
			</div>

			{/* Tab Navigation */}
			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList className="bg-secondary/50">
					<TabsTrigger
						value="overview"
						className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						Overview
					</TabsTrigger>
					<TabsTrigger
						value="time"
						className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						Time
					</TabsTrigger>
					<TabsTrigger
						value="risk"
						className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						Risk
					</TabsTrigger>
					<TabsTrigger
						value="symbols"
						className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						Symbols
					</TabsTrigger>
					<TabsTrigger
						value="behavior"
						className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						Behavior
					</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					{/* Stats Overview */}
					<StatsOverview />

					{/* Charts */}
					<div className="grid gap-6 lg:grid-cols-2">
						<ChartTerminal
							description="Breakdown of trade outcomes"
							title="Win/Loss Distribution"
						>
							<WinLossChart />
						</ChartTerminal>

						<ChartTerminal
							description="Equity curve over time"
							title="Cumulative P&L"
						>
							<CumulativePnLChart />
						</ChartTerminal>

						<div className="lg:col-span-2">
							<ChartTerminal
								description="Individual trade results (last 50)"
								title="P&L by Trade"
							>
								<PnLDistributionChart />
							</ChartTerminal>
						</div>
					</div>
				</TabsContent>

				{/* Time Tab */}
				<TabsContent value="time">
					<PlaceholderTab title="Time-Based" />
				</TabsContent>

				{/* Risk Tab */}
				<TabsContent value="risk">
					<PlaceholderTab title="Risk" />
				</TabsContent>

				{/* Symbols Tab */}
				<TabsContent value="symbols">
					<PlaceholderTab title="Symbol & Setup" />
				</TabsContent>

				{/* Behavior Tab */}
				<TabsContent value="behavior">
					<PlaceholderTab title="Behavioral" />
				</TabsContent>
			</Tabs>
		</div>
	);
}
