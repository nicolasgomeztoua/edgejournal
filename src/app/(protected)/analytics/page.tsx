"use client";

import { AgCharts } from "ag-charts-react";
import {
	BarChart3,
	Calendar,
	Clock,
	Hash,
	PieChart,
	Target,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from "@/contexts/account-context";
import {
	cn,
	formatCurrency,
	formatPercent,
	getPnLColorClass,
} from "@/lib/utils";
import { api } from "@/trpc/react";

function StatsOverview() {
	const { data: stats, isLoading } = api.trades.getStats.useQuery();

	if (isLoading) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<Card key={`skeleton-stat-${i.toString()}`}>
						<CardHeader className="pb-2">
							<Skeleton className="h-4 w-24" />
						</CardHeader>
						<CardContent>
							<Skeleton className="mb-1 h-8 w-32" />
							<Skeleton className="h-3 w-20" />
						</CardContent>
					</Card>
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
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{cards.map((card) => (
				<Card key={card.title}>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="font-medium text-muted-foreground text-sm">
							{card.title}
						</CardTitle>
						<card.icon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div
							className={cn("font-bold font-mono text-2xl", card.colorClass)}
						>
							{card.value}
						</div>
						<p className="text-muted-foreground text-xs">{card.description}</p>
					</CardContent>
				</Card>
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
				{ category: "Wins", value: stats.wins, color: "#22c55e" },
				{ category: "Losses", value: stats.losses, color: "#ef4444" },
				{ category: "Breakeven", value: stats.breakevens, color: "#eab308" },
			],
			series: [
				{
					type: "donut" as const,
					angleKey: "value",
					calloutLabelKey: "category",
					sectorLabelKey: "value",
					fills: ["#22c55e", "#ef4444", "#eab308"],
					innerRadiusRatio: 0.6,
				},
			],
			legend: {
				position: "bottom" as const,
				item: {
					label: {
						color: "#94a3b8",
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
			<div className="flex h-[300px] items-center justify-center text-muted-foreground">
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
				color: parseFloat(t.netPnl ?? "0") >= 0 ? "#22c55e" : "#ef4444",
			}));

		return {
			background: { fill: "transparent" },
			data: trades.slice(0, 50),
			series: [
				{
					type: "bar" as const,
					xKey: "trade",
					yKey: "pnl",
					fill: "#10b981",
					cornerRadius: 4,
					formatter: (params: { datum: { pnl: number } }) => ({
						fill: params.datum.pnl >= 0 ? "#22c55e" : "#ef4444",
					}),
				},
			],
			axes: [
				{
					type: "category" as const,
					position: "bottom" as const,
					label: { color: "#94a3b8" },
					line: { color: "#334155" },
				},
				{
					type: "number" as const,
					position: "left" as const,
					label: {
						color: "#94a3b8",
						formatter: (params: { value: number }) => `$${params.value}`,
					},
					line: { color: "#334155" },
					gridLine: { style: [{ stroke: "#1e293b" }] },
				},
			],
		};
	}, [data]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full" />;
	}

	if (!data?.items || data.items.length === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center text-muted-foreground">
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
					fill: "#10b98133",
					stroke: "#10b981",
					strokeWidth: 2,
					marker: { enabled: false },
				},
			],
			axes: [
				{
					type: "category" as const,
					position: "bottom" as const,
					label: { color: "#94a3b8" },
					line: { color: "#334155" },
				},
				{
					type: "number" as const,
					position: "left" as const,
					label: {
						color: "#94a3b8",
						formatter: (params: { value: number }) => `$${params.value}`,
					},
					line: { color: "#334155" },
					gridLine: { style: [{ stroke: "#1e293b" }] },
				},
			],
		};
	}, [data]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full" />;
	}

	if (!data?.items || data.items.length === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center text-muted-foreground">
				No trade data available
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

const DAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FULL_NAMES: Record<string, string> = {
	Sun: "Sunday",
	Mon: "Monday",
	Tue: "Tuesday",
	Wed: "Wednesday",
	Thu: "Thursday",
	Fri: "Friday",
	Sat: "Saturday",
};

function DayOfWeekChart() {
	const { selectedAccountId } = useAccount();
	const { data, isLoading } = api.trades.getAnalyticsBreakdown.useQuery({
		dimension: "dayOfWeek",
		accountId: selectedAccountId ?? undefined,
	});

	const chartOptions = useMemo(() => {
		if (!data?.breakdown) return {};

		const breakdown = data.breakdown as unknown as Record<
			string,
			{
				pnl: number;
				trades: number;
				wins: number;
				losses: number;
				avgPnl: number;
			}
		>;

		const chartData = DAY_ORDER.filter((day) => breakdown[day]).map((day) => ({
			day: DAY_FULL_NAMES[day],
			pnl: breakdown[day]?.pnl ?? 0,
			trades: breakdown[day]?.trades ?? 0,
			winRate:
				breakdown[day] && breakdown[day].trades > 0
					? ((breakdown[day].wins / breakdown[day].trades) * 100).toFixed(1)
					: 0,
		}));

		return {
			background: { fill: "transparent" },
			data: chartData,
			series: [
				{
					type: "bar" as const,
					xKey: "day",
					yKey: "pnl",
					fill: "#10b981",
					cornerRadius: 4,
					formatter: (params: { datum: { pnl: number } }) => ({
						fill: params.datum.pnl >= 0 ? "#22c55e" : "#ef4444",
					}),
				},
			],
			axes: [
				{
					type: "category" as const,
					position: "bottom" as const,
					label: { color: "#94a3b8", rotation: -45 },
					line: { color: "#334155" },
				},
				{
					type: "number" as const,
					position: "left" as const,
					label: {
						color: "#94a3b8",
						formatter: (params: { value: number }) => `$${params.value}`,
					},
					line: { color: "#334155" },
					gridLine: { style: [{ stroke: "#1e293b" }] },
				},
			],
			tooltip: {
				renderer: (params: {
					datum: { day: string; pnl: number; trades: number; winRate: number };
				}) => ({
					content: `${params.datum.day}: ${formatCurrency(params.datum.pnl)} (${params.datum.trades} trades, ${params.datum.winRate}% WR)`,
				}),
			},
		};
	}, [data]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full" />;
	}

	if (!data?.breakdown || Object.keys(data.breakdown).length === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center text-muted-foreground">
				No trade data available
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

function TimeOfDayChart() {
	const { selectedAccountId } = useAccount();
	const { data, isLoading } = api.trades.getAnalyticsBreakdown.useQuery({
		dimension: "hour",
		accountId: selectedAccountId ?? undefined,
	});

	const chartOptions = useMemo(() => {
		if (!data?.breakdown) return {};

		const breakdown = data.breakdown as unknown as Record<
			string,
			{
				pnl: number;
				trades: number;
				wins: number;
				losses: number;
				avgPnl: number;
			}
		>;

		// Format hours properly
		const chartData = Object.entries(breakdown)
			.map(([hour, stats]) => ({
				hour: `${hour.padStart(2, "0")}:00`,
				hourNum: parseInt(hour, 10),
				pnl: stats.pnl,
				trades: stats.trades,
				winRate:
					stats.trades > 0
						? ((stats.wins / stats.trades) * 100).toFixed(1)
						: "0",
			}))
			.sort((a, b) => a.hourNum - b.hourNum);

		return {
			background: { fill: "transparent" },
			data: chartData,
			series: [
				{
					type: "bar" as const,
					xKey: "hour",
					yKey: "pnl",
					fill: "#10b981",
					cornerRadius: 4,
					formatter: (params: { datum: { pnl: number } }) => ({
						fill: params.datum.pnl >= 0 ? "#22c55e" : "#ef4444",
					}),
				},
			],
			axes: [
				{
					type: "category" as const,
					position: "bottom" as const,
					label: { color: "#94a3b8", rotation: -45 },
					line: { color: "#334155" },
				},
				{
					type: "number" as const,
					position: "left" as const,
					label: {
						color: "#94a3b8",
						formatter: (params: { value: number }) => `$${params.value}`,
					},
					line: { color: "#334155" },
					gridLine: { style: [{ stroke: "#1e293b" }] },
				},
			],
		};
	}, [data]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full" />;
	}

	if (!data?.breakdown || Object.keys(data.breakdown).length === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center text-muted-foreground">
				No trade data available
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

function SymbolBreakdownChart() {
	const { selectedAccountId } = useAccount();
	const { data, isLoading } = api.trades.getAnalyticsBreakdown.useQuery({
		dimension: "symbol",
		accountId: selectedAccountId ?? undefined,
	});

	const chartOptions = useMemo(() => {
		if (!data?.breakdown) return {};

		const breakdown = data.breakdown as unknown as Record<
			string,
			{
				pnl: number;
				trades: number;
				wins: number;
				losses: number;
				avgPnl: number;
			}
		>;

		const chartData = Object.entries(breakdown)
			.map(([symbol, stats]) => ({
				symbol,
				pnl: stats.pnl,
				trades: stats.trades,
				winRate:
					stats.trades > 0
						? ((stats.wins / stats.trades) * 100).toFixed(1)
						: "0",
			}))
			.sort((a, b) => b.pnl - a.pnl)
			.slice(0, 10); // Top 10 symbols

		return {
			background: { fill: "transparent" },
			data: chartData,
			series: [
				{
					type: "bar" as const,
					xKey: "symbol",
					yKey: "pnl",
					fill: "#10b981",
					cornerRadius: 4,
					formatter: (params: { datum: { pnl: number } }) => ({
						fill: params.datum.pnl >= 0 ? "#22c55e" : "#ef4444",
					}),
				},
			],
			axes: [
				{
					type: "category" as const,
					position: "bottom" as const,
					label: { color: "#94a3b8", rotation: -45 },
					line: { color: "#334155" },
				},
				{
					type: "number" as const,
					position: "left" as const,
					label: {
						color: "#94a3b8",
						formatter: (params: { value: number }) => `$${params.value}`,
					},
					line: { color: "#334155" },
					gridLine: { style: [{ stroke: "#1e293b" }] },
				},
			],
		};
	}, [data]);

	if (isLoading) {
		return <Skeleton className="h-[300px] w-full" />;
	}

	if (!data?.breakdown || Object.keys(data.breakdown).length === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center text-muted-foreground">
				No trade data available
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

function SymbolTable() {
	const { selectedAccountId } = useAccount();
	const { data, isLoading } = api.trades.getAnalyticsBreakdown.useQuery({
		dimension: "symbol",
		accountId: selectedAccountId ?? undefined,
	});

	if (isLoading) {
		return (
			<div className="space-y-2">
				{[...Array(5)].map((_, i) => (
					<Skeleton
						className="h-10 w-full"
						key={`skeleton-row-${i.toString()}`}
					/>
				))}
			</div>
		);
	}

	if (!data?.breakdown || Object.keys(data.breakdown).length === 0) {
		return (
			<div className="flex h-[200px] items-center justify-center text-muted-foreground">
				No trade data available
			</div>
		);
	}

	const breakdown = data.breakdown as unknown as Record<
		string,
		{
			pnl: number;
			trades: number;
			wins: number;
			losses: number;
			avgPnl: number;
		}
	>;

	const symbols = Object.entries(breakdown)
		.map(([symbol, stats]) => ({
			symbol,
			...stats,
			winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
		}))
		.sort((a, b) => b.pnl - a.pnl);

	return (
		<div className="max-h-[400px] overflow-y-auto">
			<table className="w-full text-sm">
				<thead className="sticky top-0 bg-card">
					<tr className="border-white/10 border-b text-left text-muted-foreground">
						<th className="pb-2 font-medium">Symbol</th>
						<th className="pb-2 text-right font-medium">Trades</th>
						<th className="pb-2 text-right font-medium">Win Rate</th>
						<th className="pb-2 text-right font-medium">P&L</th>
					</tr>
				</thead>
				<tbody>
					{symbols.map((s) => (
						<tr className="border-white/5 border-b" key={s.symbol}>
							<td className="py-2 font-medium font-mono">{s.symbol}</td>
							<td className="py-2 text-right text-muted-foreground">
								{s.trades}
							</td>
							<td
								className={cn(
									"py-2 text-right font-mono",
									s.winRate >= 50 ? "text-profit" : "text-loss",
								)}
							>
								{s.winRate.toFixed(1)}%
							</td>
							<td
								className={cn(
									"py-2 text-right font-medium font-mono",
									s.pnl >= 0 ? "text-profit" : "text-loss",
								)}
							>
								{s.pnl >= 0 ? "+" : ""}
								{formatCurrency(s.pnl)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function AdvancedStats() {
	const { data, isLoading } = api.trades.getAll.useQuery({
		status: "closed",
		limit: 500,
	});

	const stats = useMemo(() => {
		if (!data?.items) return null;

		let cumulative = 0;
		let peak = 0;
		let maxDrawdown = 0;
		let currentDrawdown = 0;
		let winStreak = 0;
		let lossStreak = 0;
		let maxWinStreak = 0;
		let maxLossStreak = 0;
		let largestWin = 0;
		let largestLoss = 0;
		let totalWinAmount = 0;
		let totalLossAmount = 0;
		let winCount = 0;
		let lossCount = 0;

		const sortedTrades = [...data.items]
			.filter((t) => t.netPnl)
			.sort(
				(a, b) =>
					new Date(a.exitTime ?? 0).getTime() -
					new Date(b.exitTime ?? 0).getTime(),
			);

		sortedTrades.forEach((trade) => {
			const pnl = parseFloat(trade.netPnl ?? "0");
			cumulative += pnl;

			if (cumulative > peak) {
				peak = cumulative;
			}

			currentDrawdown = peak - cumulative;
			if (currentDrawdown > maxDrawdown) {
				maxDrawdown = currentDrawdown;
			}

			if (pnl > 0) {
				winStreak++;
				lossStreak = 0;
				maxWinStreak = Math.max(maxWinStreak, winStreak);
				largestWin = Math.max(largestWin, pnl);
				totalWinAmount += pnl;
				winCount++;
			} else if (pnl < 0) {
				lossStreak++;
				winStreak = 0;
				maxLossStreak = Math.max(maxLossStreak, lossStreak);
				if (pnl < largestLoss) largestLoss = pnl;
				totalLossAmount += Math.abs(pnl);
				lossCount++;
			}
		});

		const avgWin = winCount > 0 ? totalWinAmount / winCount : 0;
		const avgLoss = lossCount > 0 ? totalLossAmount / lossCount : 0;
		const expectancy =
			winCount + lossCount > 0
				? (winCount / (winCount + lossCount)) * avgWin -
					(lossCount / (winCount + lossCount)) * avgLoss
				: 0;

		return {
			maxDrawdown,
			maxWinStreak,
			maxLossStreak,
			largestWin,
			largestLoss,
			avgWin,
			avgLoss,
			expectancy,
			peakEquity: peak,
		};
	}, [data]);

	if (isLoading) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[...Array(6)].map((_, i) => (
					<Skeleton
						className="h-24 w-full"
						key={`skeleton-adv-${i.toString()}`}
					/>
				))}
			</div>
		);
	}

	if (!stats) {
		return (
			<div className="flex h-[200px] items-center justify-center text-muted-foreground">
				No trade data available
			</div>
		);
	}

	const statCards = [
		{
			label: "Max Drawdown",
			value: formatCurrency(stats.maxDrawdown),
			icon: TrendingDown,
			colorClass: "text-loss",
		},
		{
			label: "Largest Win",
			value: formatCurrency(stats.largestWin),
			icon: TrendingUp,
			colorClass: "text-profit",
		},
		{
			label: "Largest Loss",
			value: formatCurrency(stats.largestLoss),
			icon: TrendingDown,
			colorClass: "text-loss",
		},
		{
			label: "Max Win Streak",
			value: stats.maxWinStreak.toString(),
			icon: Target,
			colorClass: "text-profit",
		},
		{
			label: "Max Loss Streak",
			value: stats.maxLossStreak.toString(),
			icon: Target,
			colorClass: "text-loss",
		},
		{
			label: "Expectancy",
			value: formatCurrency(stats.expectancy),
			icon: BarChart3,
			colorClass: stats.expectancy >= 0 ? "text-profit" : "text-loss",
		},
	];

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{statCards.map((stat) => (
				<Card key={stat.label}>
					<CardContent className="pt-4">
						<div className="flex items-center justify-between">
							<span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
								{stat.label}
							</span>
							<stat.icon className={cn("h-4 w-4", stat.colorClass)} />
						</div>
						<div
							className={cn(
								"mt-1 font-bold font-mono text-2xl",
								stat.colorClass,
							)}
						>
							{stat.value}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export default function AnalyticsPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Analytics</h1>
				<p className="text-muted-foreground">
					Deep dive into your trading performance
				</p>
			</div>

			{/* Stats Overview */}
			<StatsOverview />

			{/* Advanced Stats */}
			<Card>
				<CardHeader>
					<CardTitle>Advanced Statistics</CardTitle>
					<CardDescription>
						Key risk metrics and trading statistics
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AdvancedStats />
				</CardContent>
			</Card>

			{/* Main Charts */}
			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Win/Loss Distribution</CardTitle>
						<CardDescription>Breakdown of trade outcomes</CardDescription>
					</CardHeader>
					<CardContent>
						<WinLossChart />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Cumulative P&L</CardTitle>
						<CardDescription>Equity curve over time</CardDescription>
					</CardHeader>
					<CardContent>
						<CumulativePnLChart />
					</CardContent>
				</Card>

				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>P&L by Trade</CardTitle>
						<CardDescription>
							Individual trade results (last 50)
						</CardDescription>
					</CardHeader>
					<CardContent>
						<PnLDistributionChart />
					</CardContent>
				</Card>
			</div>

			{/* Performance Breakdown Tabs */}
			<Card>
				<CardHeader>
					<CardTitle>Performance Breakdown</CardTitle>
					<CardDescription>
						Analyze your trading patterns across different dimensions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="dayOfWeek">
						<TabsList className="mb-4">
							<TabsTrigger className="gap-2" value="dayOfWeek">
								<Calendar className="h-4 w-4" />
								Day of Week
							</TabsTrigger>
							<TabsTrigger className="gap-2" value="timeOfDay">
								<Clock className="h-4 w-4" />
								Time of Day
							</TabsTrigger>
							<TabsTrigger className="gap-2" value="symbol">
								<Hash className="h-4 w-4" />
								Symbol
							</TabsTrigger>
						</TabsList>

						<TabsContent value="dayOfWeek">
							<DayOfWeekChart />
						</TabsContent>

						<TabsContent value="timeOfDay">
							<TimeOfDayChart />
						</TabsContent>

						<TabsContent value="symbol">
							<div className="grid gap-6 lg:grid-cols-2">
								<div>
									<h4 className="mb-4 font-medium text-muted-foreground text-sm">
										P&L by Symbol (Top 10)
									</h4>
									<SymbolBreakdownChart />
								</div>
								<div>
									<h4 className="mb-4 font-medium text-muted-foreground text-sm">
										All Symbols
									</h4>
									<SymbolTable />
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
