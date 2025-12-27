"use client";

import { AgCharts } from "ag-charts-react";
import { Activity, BarChart3, PieChart, Target, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
	cn,
	formatCurrency,
	formatPercent,
	getPnLColorClass,
} from "@/lib/utils";
import { api } from "@/trpc/react";

// Enhanced stat card matching dashboard design
function StatCard({
	title,
	value,
	description,
	icon: Icon,
	colorClass,
	accentColor = "primary",
}: {
	title: string;
	value: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	colorClass: string;
	accentColor?: "primary" | "profit" | "loss" | "accent";
}) {
	const accentClasses = {
		primary: "from-primary/10 via-primary/5 to-transparent border-primary/20",
		profit: "from-profit/10 via-profit/5 to-transparent border-profit/20",
		loss: "from-loss/10 via-loss/5 to-transparent border-loss/20",
		accent: "from-accent/10 via-accent/5 to-transparent border-accent/20",
	};

	const iconBgClasses = {
		primary: "bg-primary/10 text-primary",
		profit: "bg-profit/10 text-profit",
		loss: "bg-loss/10 text-loss",
		accent: "bg-accent/10 text-accent",
	};

	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-lg border bg-gradient-to-br p-5 transition-all duration-300",
				"hover:shadow-lg hover:shadow-black/20",
				accentClasses[accentColor],
			)}
		>
			{/* Subtle background glow on hover */}
			<div
				className={cn(
					"pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
					accentColor === "primary" && "bg-primary/20",
					accentColor === "profit" && "bg-profit/20",
					accentColor === "loss" && "bg-loss/20",
					accentColor === "accent" && "bg-accent/20",
				)}
			/>

			<div className="relative">
				<div className="flex items-center justify-between mb-3">
					<span className="font-mono text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
						{title}
					</span>
					<div className={cn("flex h-7 w-7 items-center justify-center rounded-md", iconBgClasses[accentColor])}>
						<Icon className="h-3.5 w-3.5" />
					</div>
				</div>
				<div className={cn("font-bold font-mono text-2xl tracking-tight", colorClass)}>
					{value}
				</div>
				<p className="mt-1.5 font-mono text-xs text-muted-foreground/80">
					{description}
				</p>
			</div>
		</div>
	);
}

function StatsOverview() {
	const { data: stats, isLoading } = api.trades.getStats.useQuery();

	if (isLoading) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<div
						className="rounded-lg border border-white/10 bg-white/[0.02] p-5"
						key={`skeleton-stat-${i.toString()}`}
					>
						<div className="flex items-center justify-between mb-3">
							<Skeleton className="h-3 w-16" />
							<Skeleton className="h-7 w-7 rounded-md" />
						</div>
						<Skeleton className="mb-2 h-7 w-24" />
						<Skeleton className="h-3 w-20" />
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
			accentColor: (stats.totalPnl >= 0 ? "profit" : "loss") as "profit" | "loss",
		},
		{
			title: "Win Rate",
			value: formatPercent(stats.winRate, 1).replace("+", ""),
			description: `${stats.wins}W / ${stats.losses}L`,
			icon: Target,
			colorClass: stats.winRate >= 50 ? "text-profit" : "text-loss",
			accentColor: (stats.winRate >= 50 ? "profit" : "loss") as "profit" | "loss",
		},
		{
			title: "Profit Factor",
			value:
				stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2),
			description: "Gross profit / loss",
			icon: BarChart3,
			colorClass: stats.profitFactor >= 1 ? "text-profit" : "text-loss",
			accentColor: (stats.profitFactor >= 1 ? "profit" : "loss") as "profit" | "loss",
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
			accentColor: (stats.totalPnl / Math.max(stats.totalTrades, 1) >= 0 ? "profit" : "loss") as "profit" | "loss",
		},
	];

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{cards.map((card) => (
				<StatCard
					accentColor={card.accentColor}
					colorClass={card.colorClass}
					description={card.description}
					icon={card.icon}
					key={card.title}
					title={card.title}
					value={card.value}
				/>
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
				{ category: "Breakeven", value: stats.breakevens, color: "#ffd700" },
			],
			series: [
				{
					type: "donut" as const,
					angleKey: "value",
					calloutLabelKey: "category",
					sectorLabelKey: "value",
					fills: ["#00ff88", "#ff3b3b", "#ffd700"],
					innerRadiusRatio: 0.65,
					strokeWidth: 0,
				},
			],
			legend: {
				position: "bottom" as const,
				item: {
					label: {
						color: "#737373",
						fontFamily: "JetBrains Mono, monospace",
						fontSize: 11,
					},
					marker: {
						shape: "circle",
						size: 8,
					},
					paddingX: 16,
					paddingY: 8,
				},
			},
		};
	}, [stats]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full rounded-lg" />;
	}

	if (!stats || stats.totalTrades === 0) {
		return (
			<div className="flex h-[300px] flex-col items-center justify-center text-center">
				<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
					<PieChart className="h-5 w-5 text-muted-foreground/40" />
				</div>
				<span className="font-mono text-muted-foreground text-xs">
					No trade data available
				</span>
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
					cornerRadius: 3,
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
						color: "#525252",
						fontFamily: "JetBrains Mono, monospace",
						fontSize: 9,
					},
					line: { color: "#262626" },
				},
				{
					type: "number" as const,
					position: "left" as const,
					label: {
						color: "#525252",
						fontFamily: "JetBrains Mono, monospace",
						fontSize: 9,
						formatter: (params: { value: number }) => `$${params.value}`,
					},
					line: { color: "#262626" },
					gridLine: { style: [{ stroke: "#ffffff08" }] },
				},
			],
		};
	}, [data]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full rounded-lg" />;
	}

	if (!data?.items || data.items.length === 0) {
		return (
			<div className="flex h-[300px] flex-col items-center justify-center text-center">
				<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
					<BarChart3 className="h-5 w-5 text-muted-foreground/40" />
				</div>
				<span className="font-mono text-muted-foreground text-xs">
					No trade data available
				</span>
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
					date: t.exitTime ? new Date(t.exitTime).toLocaleDateString() : "",
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
					fill: "#00ff8815",
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
						color: "#525252",
						fontFamily: "JetBrains Mono, monospace",
						fontSize: 9,
					},
					line: { color: "#262626" },
				},
				{
					type: "number" as const,
					position: "left" as const,
					label: {
						color: "#525252",
						fontFamily: "JetBrains Mono, monospace",
						fontSize: 9,
						formatter: (params: { value: number }) => `$${params.value}`,
					},
					line: { color: "#262626" },
					gridLine: { style: [{ stroke: "#ffffff08" }] },
				},
			],
		};
	}, [data]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full rounded-lg" />;
	}

	if (!data?.items || data.items.length === 0) {
		return (
			<div className="flex h-[300px] flex-col items-center justify-center text-center">
				<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
					<Activity className="h-5 w-5 text-muted-foreground/40" />
				</div>
				<span className="font-mono text-muted-foreground text-xs">
					No trade data available
				</span>
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

// Enhanced terminal window wrapper for charts
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
		<div className="overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
			{/* Terminal header */}
			<div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-2.5">
				<div className="flex items-center gap-1.5">
					<div className="h-2.5 w-2.5 rounded-full bg-loss/50 shadow-[0_0_6px_rgba(255,59,59,0.5)]" />
					<div className="h-2.5 w-2.5 rounded-full bg-breakeven/50 shadow-[0_0_6px_rgba(255,215,0,0.5)]" />
					<div className="h-2.5 w-2.5 rounded-full bg-profit/50 shadow-[0_0_6px_rgba(0,255,136,0.5)]" />
				</div>
				<div className="text-center">
					<span className="font-mono text-[10px] text-muted-foreground/70">
						{title.toLowerCase().replace(/\s+/g, "-")}
					</span>
				</div>
				<div className="w-14" />
			</div>
			{/* Chart header */}
			<div className="border-b border-white/10 px-5 py-4">
				<h3 className="font-semibold text-sm">{title}</h3>
				<p className="font-mono text-[11px] text-muted-foreground/80 mt-0.5">
					{description}
				</p>
			</div>
			{/* Chart content */}
			<div className="p-5">{children}</div>
		</div>
	);
}

export default function AnalyticsPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<div className="flex items-center gap-3 mb-2">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
						<Activity className="h-5 w-5 text-accent" />
					</div>
					<span className="font-mono text-accent text-xs font-medium uppercase tracking-wider">
						Performance
					</span>
				</div>
				<h1 className="font-bold text-4xl tracking-tight">Analytics</h1>
				<p className="mt-2 font-mono text-muted-foreground text-sm">
					Visualize your trading performance and identify patterns
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
