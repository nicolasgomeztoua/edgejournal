"use client";

import { AgCharts } from "ag-charts-react";
import {
	BarChart3,
	Calendar,
	Clock,
	PieChart,
	Tag,
	Target,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DateRangePicker,
	type DateRange,
	dateRangePresets,
} from "@/components/ui/date-range-picker";
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

function StatsOverview({
	accountId,
	dateRange,
}: {
	accountId: number | null;
	dateRange: DateRange | undefined;
}) {
	const { data: stats, isLoading } = api.trades.getStats.useQuery({
		accountId: accountId ?? undefined,
		startDate: dateRange?.from.toISOString(),
		endDate: dateRange?.to.toISOString(),
	});

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
			description: `${stats.wins}W / ${stats.losses}L / ${stats.breakevens}BE`,
			icon: Target,
			colorClass: stats.winRate >= 50 ? "text-profit" : "text-loss",
		},
		{
			title: "Profit Factor",
			value:
				stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2),
			description: `GProfit: ${formatCurrency(stats.grossProfit)}`,
			icon: BarChart3,
			colorClass: stats.profitFactor >= 1 ? "text-profit" : "text-loss",
		},
		{
			title: "Expectancy",
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

function WinLossChart({
	accountId,
	dateRange,
}: {
	accountId: number | null;
	dateRange: DateRange | undefined;
}) {
	const { data: stats, isLoading } = api.trades.getStats.useQuery({
		accountId: accountId ?? undefined,
		startDate: dateRange?.from.toISOString(),
		endDate: dateRange?.to.toISOString(),
	});

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

function CumulativePnLChart({
	accountId,
	dateRange,
}: {
	accountId: number | null;
	dateRange: DateRange | undefined;
}) {
	const { data, isLoading } = api.trades.getAll.useQuery({
		status: "closed",
		limit: 500,
		accountId: accountId ?? undefined,
		startDate: dateRange?.from.toISOString(),
		endDate: dateRange?.to.toISOString(),
	});

	const chartOptions = useMemo(() => {
		if (!data?.items) return {};

		let cumulative = 0;
		let maxEquity = 0;
		const trades = data.items
			.filter((t) => t.netPnl)
			.reverse()
			.map((t, i) => {
				cumulative += parseFloat(t.netPnl ?? "0");
				maxEquity = Math.max(maxEquity, cumulative);
				const drawdown = maxEquity > 0 ? ((maxEquity - cumulative) / maxEquity) * 100 : 0;
				return {
					trade: i + 1,
					pnl: cumulative,
					drawdown: -drawdown,
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
					label: { color: "#94a3b8", fontSize: 10 },
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

function DayOfWeekPerformance({
	accountId,
	dateRange,
}: {
	accountId: number | null;
	dateRange: DateRange | undefined;
}) {
	const { data, isLoading } = api.trades.getDayOfWeekStats.useQuery({
		accountId: accountId ?? undefined,
		startDate: dateRange?.from.toISOString(),
		endDate: dateRange?.to.toISOString(),
	});

	const chartOptions = useMemo(() => {
		if (!data) return {};

		// Filter out weekend days with no trades
		const tradingDays = data.filter((_d, i) => i >= 1 && i <= 5);

		return {
			background: { fill: "transparent" },
			data: tradingDays.map((d) => ({
				day: d.day.slice(0, 3),
				pnl: d.pnl,
				trades: d.trades,
				winRate: d.winRate,
				fill: d.pnl >= 0 ? "#22c55e" : "#ef4444",
			})),
			series: [
				{
					type: "bar" as const,
					xKey: "day",
					yKey: "pnl",
					cornerRadius: 4,
					formatter: (params: { datum: { fill: string } }) => ({
						fill: params.datum.fill,
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
		return <Skeleton className="h-[250px] w-full" />;
	}

	if (!data || data.every((d) => d.trades === 0)) {
		return (
			<div className="flex h-[250px] items-center justify-center text-muted-foreground">
				No trade data available
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 250 }} />;
}

function HourlyPerformance({
	accountId,
	dateRange,
}: {
	accountId: number | null;
	dateRange: DateRange | undefined;
}) {
	const { data, isLoading } = api.trades.getHourlyStats.useQuery({
		accountId: accountId ?? undefined,
		startDate: dateRange?.from.toISOString(),
		endDate: dateRange?.to.toISOString(),
	});

	const chartOptions = useMemo(() => {
		if (!data) return {};

		// Only show hours with trades
		const activeHours = data.filter((h) => h.trades > 0);

		return {
			background: { fill: "transparent" },
			data: activeHours.map((h) => ({
				hour: `${h.hour.toString().padStart(2, "0")}:00`,
				pnl: h.pnl,
				trades: h.trades,
				fill: h.pnl >= 0 ? "#22c55e" : "#ef4444",
			})),
			series: [
				{
					type: "bar" as const,
					xKey: "hour",
					yKey: "pnl",
					cornerRadius: 4,
					formatter: (params: { datum: { fill: string } }) => ({
						fill: params.datum.fill,
					}),
				},
			],
			axes: [
				{
					type: "category" as const,
					position: "bottom" as const,
					label: { color: "#94a3b8", fontSize: 10 },
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
		return <Skeleton className="h-[250px] w-full" />;
	}

	if (!data || data.every((h) => h.trades === 0)) {
		return (
			<div className="flex h-[250px] items-center justify-center text-muted-foreground">
				No trade data available
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 250 }} />;
}

function SymbolPerformance({
	accountId,
	dateRange,
}: {
	accountId: number | null;
	dateRange: DateRange | undefined;
}) {
	const { data, isLoading } = api.trades.getSymbolStats.useQuery({
		accountId: accountId ?? undefined,
		startDate: dateRange?.from.toISOString(),
		endDate: dateRange?.to.toISOString(),
	});

	if (isLoading) {
		return (
			<div className="space-y-3">
				{[1, 2, 3, 4, 5].map((i) => (
					<Skeleton className="h-12" key={`skeleton-symbol-${i}`} />
				))}
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center text-muted-foreground">
				No symbol data available
			</div>
		);
	}

	const maxAbsPnl = data.reduce((max, s) => Math.max(max, Math.abs(s.pnl)), 1);

	return (
		<div className="space-y-2">
			{data.slice(0, 10).map((s) => {
				const width = (Math.abs(s.pnl) / maxAbsPnl) * 100;
				return (
					<div
						className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
						key={s.symbol}
					>
						<div className="flex items-center gap-4">
							<span className="w-20 font-mono font-semibold text-sm">
								{s.symbol}
							</span>
							<div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
								<div
									className={cn(
										"h-full rounded-full transition-all",
										s.pnl >= 0 ? "bg-profit" : "bg-loss",
									)}
									style={{ width: `${width}%` }}
								/>
							</div>
						</div>
						<div className="flex items-center gap-6">
							<div className="text-right">
								<div className="text-muted-foreground text-xs">Trades</div>
								<div className="font-mono text-sm">{s.trades}</div>
							</div>
							<div className="text-right">
								<div className="text-muted-foreground text-xs">Win Rate</div>
								<div
									className={cn(
										"font-mono text-sm",
										s.winRate >= 50 ? "text-profit" : "text-loss",
									)}
								>
									{s.winRate.toFixed(0)}%
								</div>
							</div>
							<div className="w-24 text-right">
								<div className="text-muted-foreground text-xs">P&L</div>
								<div
									className={cn(
										"font-mono text-sm",
										s.pnl >= 0 ? "text-profit" : "text-loss",
									)}
								>
									{s.pnl >= 0 ? "+" : ""}
									{formatCurrency(s.pnl)}
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function SetupPerformance({
	accountId,
	dateRange,
}: {
	accountId: number | null;
	dateRange: DateRange | undefined;
}) {
	const { data, isLoading } = api.trades.getSetupStats.useQuery({
		accountId: accountId ?? undefined,
		startDate: dateRange?.from.toISOString(),
		endDate: dateRange?.to.toISOString(),
	});

	if (isLoading) {
		return (
			<div className="space-y-3">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton className="h-12" key={`skeleton-setup-${i}`} />
				))}
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
				<Tag className="mb-2 h-8 w-8 opacity-50" />
				<div>No setup data available</div>
				<p className="mt-1 text-xs">Tag your trades with setup types to see performance</p>
			</div>
		);
	}

	const maxAbsPnl = data.reduce((max, s) => Math.max(max, Math.abs(s.pnl)), 1);

	return (
		<div className="space-y-2">
			{data.map((s) => {
				const width = (Math.abs(s.pnl) / maxAbsPnl) * 100;
				// Format setup name nicely
				const setupName = s.setup
					.replace(/_/g, " ")
					.replace(/\b\w/g, (c) => c.toUpperCase());
				return (
					<div
						className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
						key={s.setup}
					>
						<div className="flex items-center gap-4">
							<div className="flex w-40 items-center gap-2">
								<Tag className="h-3 w-3 text-muted-foreground" />
								<span className="text-sm">{setupName}</span>
							</div>
							<div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
								<div
									className={cn(
										"h-full rounded-full transition-all",
										s.pnl >= 0 ? "bg-profit" : "bg-loss",
									)}
									style={{ width: `${width}%` }}
								/>
							</div>
						</div>
						<div className="flex items-center gap-6">
							<div className="text-right">
								<div className="text-muted-foreground text-xs">Trades</div>
								<div className="font-mono text-sm">{s.trades}</div>
							</div>
							<div className="text-right">
								<div className="text-muted-foreground text-xs">Win Rate</div>
								<div
									className={cn(
										"font-mono text-sm",
										s.winRate >= 50 ? "text-profit" : "text-loss",
									)}
								>
									{s.winRate.toFixed(0)}%
								</div>
							</div>
							<div className="w-24 text-right">
								<div className="text-muted-foreground text-xs">P&L</div>
								<div
									className={cn(
										"font-mono text-sm",
										s.pnl >= 0 ? "text-profit" : "text-loss",
									)}
								>
									{s.pnl >= 0 ? "+" : ""}
									{formatCurrency(s.pnl)}
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function DrawdownAnalysis({
	accountId,
	dateRange,
}: {
	accountId: number | null;
	dateRange: DateRange | undefined;
}) {
	const { data, isLoading } = api.trades.getAll.useQuery({
		status: "closed",
		limit: 500,
		accountId: accountId ?? undefined,
		startDate: dateRange?.from.toISOString(),
		endDate: dateRange?.to.toISOString(),
	});

	const analysis = useMemo(() => {
		if (!data?.items || data.items.length === 0) {
			return {
				maxDrawdown: 0,
				maxDrawdownPercent: 0,
				currentDrawdown: 0,
				currentDrawdownPercent: 0,
				avgDrawdown: 0,
				drawdowns: [] as { trade: number; drawdown: number }[],
			};
		}

		let cumulative = 0;
		let maxEquity = 0;
		let maxDrawdown = 0;
		const drawdowns: { trade: number; drawdown: number; percent: number }[] = [];

		const trades = data.items.filter((t) => t.netPnl).reverse();
		trades.forEach((t, i) => {
			cumulative += parseFloat(t.netPnl ?? "0");
			maxEquity = Math.max(maxEquity, cumulative);
			const drawdown = maxEquity - cumulative;
			const drawdownPercent = maxEquity > 0 ? (drawdown / maxEquity) * 100 : 0;
			maxDrawdown = Math.max(maxDrawdown, drawdown);
			drawdowns.push({ trade: i + 1, drawdown, percent: drawdownPercent });
		});

		const currentDrawdown = drawdowns[drawdowns.length - 1]?.drawdown ?? 0;
		const currentDrawdownPercent = drawdowns[drawdowns.length - 1]?.percent ?? 0;
		const avgDrawdown =
			drawdowns.length > 0
				? drawdowns.reduce((sum, d) => sum + d.drawdown, 0) / drawdowns.length
				: 0;

		return {
			maxDrawdown,
			maxDrawdownPercent:
				maxEquity > 0 ? (maxDrawdown / maxEquity) * 100 : 0,
			currentDrawdown,
			currentDrawdownPercent,
			avgDrawdown,
			drawdowns,
		};
	}, [data]);

	const chartOptions = useMemo(() => {
		if (analysis.drawdowns.length === 0) return {};

		return {
			background: { fill: "transparent" },
			data: analysis.drawdowns.map((d) => ({
				trade: d.trade,
				drawdown: -d.drawdown,
			})),
			series: [
				{
					type: "area" as const,
					xKey: "trade",
					yKey: "drawdown",
					fill: "#ef444433",
					stroke: "#ef4444",
					strokeWidth: 2,
					marker: { enabled: false },
				},
			],
			axes: [
				{
					type: "category" as const,
					position: "bottom" as const,
					label: { color: "#94a3b8", fontSize: 10 },
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
	}, [analysis]);

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

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
					<div className="text-muted-foreground text-xs">Max Drawdown</div>
					<div className="font-mono font-semibold text-lg text-loss">
						-{formatCurrency(analysis.maxDrawdown)}
					</div>
					<div className="text-muted-foreground text-xs">
						{analysis.maxDrawdownPercent.toFixed(1)}%
					</div>
				</div>
				<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
					<div className="text-muted-foreground text-xs">Current Drawdown</div>
					<div
						className={cn(
							"font-mono font-semibold text-lg",
							analysis.currentDrawdown > 0 ? "text-loss" : "text-profit",
						)}
					>
						{analysis.currentDrawdown > 0
							? `-${formatCurrency(analysis.currentDrawdown)}`
							: "At Peak"}
					</div>
					<div className="text-muted-foreground text-xs">
						{analysis.currentDrawdownPercent.toFixed(1)}%
					</div>
				</div>
				<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
					<div className="text-muted-foreground text-xs">Avg Drawdown</div>
					<div className="font-mono font-semibold text-lg text-yellow-500">
						-{formatCurrency(analysis.avgDrawdown)}
					</div>
				</div>
				<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
					<div className="text-muted-foreground text-xs">Recovery</div>
					<div
						className={cn(
							"font-mono font-semibold text-lg",
							analysis.currentDrawdown === 0 ? "text-profit" : "text-yellow-500",
						)}
					>
						{analysis.currentDrawdown === 0
							? "Fully Recovered"
							: `$${(analysis.maxDrawdown - analysis.currentDrawdown).toFixed(0)} to go`}
					</div>
				</div>
			</div>
			{/* biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing */}
			<AgCharts options={chartOptions as any} style={{ height: 200 }} />
		</div>
	);
}

export default function AnalyticsPage() {
	const { selectedAccount, selectedAccountId } = useAccount();
	const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
		const preset = dateRangePresets.find((p) => p.key === "allTime");
		return preset?.getRange();
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Analytics</h1>
					{selectedAccount && (
						<p className="text-muted-foreground text-sm">
							{selectedAccount.name} performance analysis
						</p>
					)}
				</div>
				<DateRangePicker onChange={setDateRange} value={dateRange} />
			</div>

			{/* Stats Overview */}
			<StatsOverview accountId={selectedAccountId} dateRange={dateRange} />

			{/* Main Charts */}
			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<PieChart className="h-4 w-4" />
							Win/Loss Distribution
						</CardTitle>
						<CardDescription>Breakdown of trade outcomes</CardDescription>
					</CardHeader>
					<CardContent>
						<WinLossChart accountId={selectedAccountId} dateRange={dateRange} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-4 w-4" />
							Equity Curve
						</CardTitle>
						<CardDescription>Cumulative P&L over trades</CardDescription>
					</CardHeader>
					<CardContent>
						<CumulativePnLChart
							accountId={selectedAccountId}
							dateRange={dateRange}
						/>
					</CardContent>
				</Card>
			</div>

			{/* Time-Based Analytics */}
			<Tabs className="space-y-4" defaultValue="dayOfWeek">
				<div className="flex items-center justify-between">
					<h2 className="flex items-center gap-2 font-semibold text-lg">
						<Clock className="h-4 w-4" />
						Time-Based Performance
					</h2>
					<TabsList>
						<TabsTrigger value="dayOfWeek">Day of Week</TabsTrigger>
						<TabsTrigger value="hourly">Hourly</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent value="dayOfWeek">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								Performance by Day of Week
							</CardTitle>
							<CardDescription>
								See which days you trade best on
							</CardDescription>
						</CardHeader>
						<CardContent>
							<DayOfWeekPerformance
								accountId={selectedAccountId}
								dateRange={dateRange}
							/>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="hourly">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								Performance by Hour
							</CardTitle>
							<CardDescription>
								See your best and worst trading hours
							</CardDescription>
						</CardHeader>
						<CardContent>
							<HourlyPerformance
								accountId={selectedAccountId}
								dateRange={dateRange}
							/>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Symbol & Setup Analysis */}
			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BarChart3 className="h-4 w-4" />
							Symbol Performance
						</CardTitle>
						<CardDescription>P&L breakdown by trading symbol</CardDescription>
					</CardHeader>
					<CardContent>
						<SymbolPerformance
							accountId={selectedAccountId}
							dateRange={dateRange}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Tag className="h-4 w-4" />
							Setup / Playbook Performance
						</CardTitle>
						<CardDescription>P&L breakdown by trade setup type</CardDescription>
					</CardHeader>
					<CardContent>
						<SetupPerformance
							accountId={selectedAccountId}
							dateRange={dateRange}
						/>
					</CardContent>
				</Card>
			</div>

			{/* Drawdown Analysis */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingDown className="h-4 w-4" />
						Drawdown Analysis
					</CardTitle>
					<CardDescription>
						Track your equity peaks and drawdowns
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DrawdownAnalysis
						accountId={selectedAccountId}
						dateRange={dateRange}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
