"use client";

import { AgCharts } from "ag-charts-react";
import { ArrowLeft, BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import { api } from "@/trpc/react";

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

function StrategyComparisonTable() {
	const { data: stats, isLoading } = api.strategies.getAllStats.useQuery();

	if (isLoading) {
		return (
			<div className="space-y-3">
				{[...Array(3)].map((_, i) => (
					<Skeleton className="h-12 w-full" key={`skeleton-${i.toString()}`} />
				))}
			</div>
		);
	}

	if (!stats || stats.length === 0) {
		return (
			<div className="flex h-32 items-center justify-center font-mono text-muted-foreground text-xs">
				No strategies found. Create strategies and assign them to trades to see
				analytics.
			</div>
		);
	}

	// Sort by total P&L descending
	const sortedStats = [...stats].sort((a, b) => b.totalPnl - a.totalPnl);

	return (
		<div className="overflow-hidden rounded border border-border">
			<Table>
				<TableHeader>
					<TableRow className="border-border hover:bg-transparent">
						<TableHead className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Strategy
						</TableHead>
						<TableHead className="text-right font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Trades
						</TableHead>
						<TableHead className="text-right font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Win Rate
						</TableHead>
						<TableHead className="text-right font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Profit Factor
						</TableHead>
						<TableHead className="text-right font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Total P&L
						</TableHead>
						<TableHead className="text-right font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Avg P&L
						</TableHead>
						<TableHead className="text-right font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Avg R
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedStats.map((s) => (
						<TableRow className="border-border" key={s.strategyId}>
							<TableCell>
								<Link
									className="flex items-center gap-2 transition-colors hover:text-primary"
									href={`/strategies/${s.strategyId}`}
								>
									<div
										className="h-2 w-2 shrink-0 rounded-full"
										style={{
											backgroundColor: s.strategyColor ?? "#d4ff00",
										}}
									/>
									<span className="font-medium font-mono text-sm">
										{s.strategyName}
									</span>
								</Link>
							</TableCell>
							<TableCell className="text-right font-mono text-sm">
								{s.totalTrades}
							</TableCell>
							<TableCell className="text-right">
								<span
									className={cn(
										"font-mono text-sm",
										s.totalTrades > 0
											? s.winRate >= 50
												? "text-profit"
												: "text-loss"
											: "text-muted-foreground",
									)}
								>
									{s.totalTrades > 0 ? `${s.winRate.toFixed(1)}%` : "—"}
								</span>
							</TableCell>
							<TableCell className="text-right">
								<span
									className={cn(
										"font-mono text-sm",
										s.totalTrades > 0
											? s.profitFactor >= 1
												? "text-profit"
												: "text-loss"
											: "text-muted-foreground",
									)}
								>
									{s.totalTrades > 0
										? s.profitFactor === Infinity
											? "∞"
											: s.profitFactor.toFixed(2)
										: "—"}
								</span>
							</TableCell>
							<TableCell className="text-right">
								<span
									className={cn(
										"font-bold font-mono text-sm",
										s.totalTrades > 0
											? s.totalPnl >= 0
												? "text-profit"
												: "text-loss"
											: "text-muted-foreground",
									)}
								>
									{s.totalTrades > 0 ? formatCurrency(s.totalPnl) : "—"}
								</span>
							</TableCell>
							<TableCell className="text-right">
								<span
									className={cn(
										"font-mono text-sm",
										s.totalTrades > 0
											? s.avgPnl >= 0
												? "text-profit"
												: "text-loss"
											: "text-muted-foreground",
									)}
								>
									{s.totalTrades > 0 ? formatCurrency(s.avgPnl) : "—"}
								</span>
							</TableCell>
							<TableCell className="text-right">
								<span
									className={cn(
										"font-mono text-sm",
										s.avgRMultiple !== null
											? s.avgRMultiple >= 0
												? "text-profit"
												: "text-loss"
											: "text-muted-foreground",
									)}
								>
									{s.avgRMultiple !== null
										? `${s.avgRMultiple.toFixed(2)}R`
										: "—"}
								</span>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

function WinRateChart() {
	const { data: stats, isLoading } = api.strategies.getAllStats.useQuery();

	const chartOptions = useMemo(() => {
		if (!stats || stats.length === 0) return {};

		const dataWithTrades = stats.filter((s) => s.totalTrades > 0);
		if (dataWithTrades.length === 0) return {};

		const chartData = dataWithTrades
			.sort((a, b) => b.winRate - a.winRate)
			.map((s) => ({
				strategy: s.strategyName,
				winRate: s.winRate,
				color: s.strategyColor ?? "#d4ff00",
			}));

		return {
			background: { fill: "transparent" },
			data: chartData,
			series: [
				{
					type: "bar" as const,
					xKey: "strategy",
					yKey: "winRate",
					cornerRadius: 2,
					formatter: (params: { datum: { color: string } }) => ({
						fill: params.datum.color,
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
						rotation: -45,
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
						formatter: (params: { value: number }) => `${params.value}%`,
					},
					line: { color: "#1e293b" },
					gridLine: { style: [{ stroke: "#ffffff08" }] },
					min: 0,
					max: 100,
				},
			],
		};
	}, [stats]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full" />;
	}

	if (!stats || stats.filter((s) => s.totalTrades > 0).length === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center font-mono text-muted-foreground text-xs">
				No strategy data available
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

function TotalPnLChart() {
	const { data: stats, isLoading } = api.strategies.getAllStats.useQuery();

	const chartOptions = useMemo(() => {
		if (!stats || stats.length === 0) return {};

		const dataWithTrades = stats.filter((s) => s.totalTrades > 0);
		if (dataWithTrades.length === 0) return {};

		const chartData = dataWithTrades
			.sort((a, b) => b.totalPnl - a.totalPnl)
			.map((s) => ({
				strategy: s.strategyName,
				pnl: s.totalPnl,
				color: s.totalPnl >= 0 ? "#00ff88" : "#ff3b3b",
			}));

		return {
			background: { fill: "transparent" },
			data: chartData,
			series: [
				{
					type: "bar" as const,
					xKey: "strategy",
					yKey: "pnl",
					cornerRadius: 2,
					formatter: (params: { datum: { color: string } }) => ({
						fill: params.datum.color,
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
						rotation: -45,
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
	}, [stats]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full" />;
	}

	if (!stats || stats.filter((s) => s.totalTrades > 0).length === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center font-mono text-muted-foreground text-xs">
				No strategy data available
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

function ProfitFactorChart() {
	const { data: stats, isLoading } = api.strategies.getAllStats.useQuery();

	const chartOptions = useMemo(() => {
		if (!stats || stats.length === 0) return {};

		const dataWithTrades = stats.filter(
			(s) => s.totalTrades > 0 && s.profitFactor !== Infinity,
		);
		if (dataWithTrades.length === 0) return {};

		const chartData = dataWithTrades
			.sort((a, b) => b.profitFactor - a.profitFactor)
			.map((s) => ({
				strategy: s.strategyName,
				profitFactor: s.profitFactor,
				color: s.profitFactor >= 1 ? "#00ff88" : "#ff3b3b",
			}));

		return {
			background: { fill: "transparent" },
			data: chartData,
			series: [
				{
					type: "bar" as const,
					xKey: "strategy",
					yKey: "profitFactor",
					cornerRadius: 2,
					formatter: (params: { datum: { color: string } }) => ({
						fill: params.datum.color,
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
						rotation: -45,
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
					},
					line: { color: "#1e293b" },
					gridLine: { style: [{ stroke: "#ffffff08" }] },
					min: 0,
				},
			],
		};
	}, [stats]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full" />;
	}

	if (
		!stats ||
		stats.filter((s) => s.totalTrades > 0 && s.profitFactor !== Infinity)
			.length === 0
	) {
		return (
			<div className="flex h-[300px] items-center justify-center font-mono text-muted-foreground text-xs">
				No strategy data available
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

function CumulativePnLCurveChart() {
	const { data, isLoading } = api.strategies.getComparativeData.useQuery();

	const chartOptions = useMemo(() => {
		if (!data || data.length === 0) return {};

		// Only include strategies with at least 2 data points
		const strategiesWithData = data.filter((s) => s.dataPoints.length >= 2);
		if (strategiesWithData.length === 0) return {};

		// Build series for each strategy
		const series = strategiesWithData.map((s) => ({
			type: "line" as const,
			xKey: "tradeNumber",
			yKey: s.strategyName.replace(/\s+/g, "_"),
			stroke: s.strategyColor,
			strokeWidth: 2,
			marker: { enabled: false },
			title: s.strategyName,
		}));

		// Merge all data points into a unified dataset
		// Each row has tradeNumber and P&L for each strategy
		const maxTrades = Math.max(...strategiesWithData.map((s) => s.dataPoints.length));
		const mergedData = [];

		for (let i = 0; i < maxTrades; i++) {
			const row: Record<string, number | null> = { tradeNumber: i + 1 };
			for (const s of strategiesWithData) {
				const key = s.strategyName.replace(/\s+/g, "_");
				row[key] = s.dataPoints[i]?.pnl ?? null;
			}
			mergedData.push(row);
		}

		return {
			background: { fill: "transparent" },
			data: mergedData,
			series,
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
			axes: [
				{
					type: "number" as const,
					position: "bottom" as const,
					label: {
						color: "#64748b",
						fontFamily: "JetBrains Mono, monospace",
						fontSize: 9,
					},
					line: { color: "#1e293b" },
					title: {
						text: "Trade #",
						color: "#64748b",
						fontFamily: "JetBrains Mono, monospace",
						fontSize: 10,
					},
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
		return <Skeleton className="h-[350px] w-full" />;
	}

	if (!data || data.filter((s) => s.dataPoints.length >= 2).length === 0) {
		return (
			<div className="flex h-[350px] items-center justify-center font-mono text-muted-foreground text-xs">
				Not enough trade data to display curves. Each strategy needs at least 2
				trades.
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 350 }} />;
}

export default function StrategyAnalyticsPage() {
	return (
		<div className="mx-auto w-[95%] max-w-none space-y-8 py-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button asChild size="icon" variant="ghost">
					<Link href="/strategies">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<span className="mb-2 block font-mono text-primary text-xs uppercase tracking-wider">
						Strategies
					</span>
					<h1 className="font-bold text-3xl tracking-tight">
						Strategy Analytics
					</h1>
					<p className="mt-1 font-mono text-muted-foreground text-sm">
						Compare performance across all your trading strategies
					</p>
				</div>
			</div>

			{/* Comparison Table */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<BarChart3 className="h-4 w-4 text-primary" />
					<h2 className="font-mono font-semibold text-lg uppercase tracking-wider">
						Performance Comparison
					</h2>
				</div>
				<StrategyComparisonTable />
			</div>

			{/* Charts Grid */}
			<div className="grid gap-6 lg:grid-cols-2">
				<ChartTerminal
					description="Win rate percentage by strategy"
					title="Win Rate by Strategy"
				>
					<WinRateChart />
				</ChartTerminal>

				<ChartTerminal
					description="Total profit/loss by strategy"
					title="Total P&L by Strategy"
				>
					<TotalPnLChart />
				</ChartTerminal>

				<ChartTerminal
					description="Profit factor comparison (higher is better)"
					title="Profit Factor by Strategy"
				>
					<ProfitFactorChart />
				</ChartTerminal>

				<ChartTerminal
					description="Equity curves compared"
					title="Cumulative P&L Curves"
				>
					<CumulativePnLCurveChart />
				</ChartTerminal>
			</div>
		</div>
	);
}

