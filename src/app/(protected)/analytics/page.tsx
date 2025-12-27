"use client";

import { AgCharts } from "ag-charts-react";
import { BarChart3, PieChart, Target, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
	cn,
	formatCurrency,
	formatDate,
	formatPercent,
	getPnLColorClass,
} from "@/lib/utils";
import { api } from "@/trpc/react";

function StatsOverview() {
	const { data: stats, isLoading } = api.trades.getStats.useQuery();

	if (isLoading) {
		return (
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
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

	if (!stats) return null;

	const cards = [
		{
			title: "Total P&L",
			value: formatCurrency(stats.totalPnl),
			description: `${stats.totalTrades} closed trades`,
			icon: TrendingUp,
			colorClass: getPnLColorClass(stats.totalPnl),
		},
		{
			title: "Win Rate",
			value: formatPercent(stats.winRate, 1).replace("+", ""),
			description: `${stats.wins}W / ${stats.losses}L`,
			icon: Target,
			colorClass: stats.winRate >= 50 ? "text-profit" : "text-loss",
		},
		{
			title: "Profit Factor",
			value:
				stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2),
			description: "Gross profit / loss",
			icon: BarChart3,
			colorClass: stats.profitFactor >= 1 ? "text-profit" : "text-loss",
		},
		{
			title: "Avg Trade",
			value: formatCurrency(
				stats.totalTrades > 0 ? stats.totalPnl / stats.totalTrades : 0,
			),
			description: `Avg win: ${formatCurrency(stats.avgWin)}`,
			icon: PieChart,
			colorClass: getPnLColorClass(
				stats.totalPnl / Math.max(stats.totalTrades, 1),
			),
		},
	];

	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{cards.map((card) => (
				<div
					className="rounded border border-border bg-card p-4 transition-all hover:border-primary/30"
					key={card.title}
				>
					<div className="flex items-center justify-between">
						<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							{card.title}
						</span>
						<card.icon className="h-3 w-3 text-muted-foreground" />
					</div>
					<div
						className={cn("mt-2 font-bold font-mono text-xl", card.colorClass)}
					>
						{card.value}
					</div>
					<p className="mt-1 font-mono text-[10px] text-muted-foreground">
						{card.description}
					</p>
				</div>
			))}
		</div>
	);
}

function WinLossChart() {
	const { data: stats, isLoading } = api.trades.getStats.useQuery();

	const chartOptions = useMemo(() => {
		if (!stats) return {};

		return {
			background: { fill: "transparent" },
			data: [
				{ category: "Wins", value: stats.wins, color: "#00ff88" },
				{ category: "Losses", value: stats.losses, color: "#ff3b3b" },
				{ category: "Breakeven", value: stats.breakevens, color: "#f5a623" },
			],
			series: [
				{
					type: "donut" as const,
					angleKey: "value",
					calloutLabelKey: "category",
					sectorLabelKey: "value",
					fills: ["#00ff88", "#ff3b3b", "#f5a623"],
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
	}, [stats]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full" />;
	}

	if (!stats || stats.totalTrades === 0) {
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

// Terminal window wrapper for charts
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
					Visualize your trading performance
				</p>
			</div>

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
		</div>
	);
}
