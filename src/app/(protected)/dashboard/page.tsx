"use client";

import { AgCharts } from "ag-charts-react";
import {
	ArrowRight,
	Calendar,
	Info,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "@/contexts/account-context";
import { cn, formatCurrency, getPnLColorClass } from "@/lib/utils";
import { api } from "@/trpc/react";

// Circular progress component for gauges
function CircularProgress({
	value,
	max = 100,
	size = 80,
	strokeWidth = 8,
	color = "stroke-primary",
	bgColor = "stroke-muted",
}: {
	value: number;
	max?: number;
	size?: number;
	strokeWidth?: number;
	color?: string;
	bgColor?: string;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const percent = Math.min(Math.max(value / max, 0), 1);
	const offset = circumference - percent * circumference;

	return (
		<svg
			aria-hidden="true"
			className="-rotate-90 transform"
			height={size}
			width={size}
		>
			<title>Progress indicator</title>
			<circle
				className={bgColor}
				cx={size / 2}
				cy={size / 2}
				fill="none"
				r={radius}
				strokeWidth={strokeWidth}
			/>
			<circle
				className={cn(color, "transition-all duration-500")}
				cx={size / 2}
				cy={size / 2}
				fill="none"
				r={radius}
				strokeDasharray={circumference}
				strokeDashoffset={offset}
				strokeLinecap="round"
				strokeWidth={strokeWidth}
			/>
		</svg>
	);
}

// Mini bar for win/loss visualization
function WinLossBar({
	wins,
	losses,
	breakevens,
}: {
	wins: number;
	losses: number;
	breakevens: number;
}) {
	const total = wins + losses + breakevens;
	if (total === 0) return null;

	const winPercent = (wins / total) * 100;
	const bePercent = (breakevens / total) * 100;
	const lossPercent = (losses / total) * 100;

	return (
		<div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
			<div
				className="bg-profit transition-all"
				style={{ width: `${winPercent}%` }}
			/>
			<div
				className="bg-yellow-500 transition-all"
				style={{ width: `${bePercent}%` }}
			/>
			<div
				className="bg-loss transition-all"
				style={{ width: `${lossPercent}%` }}
			/>
		</div>
	);
}

function StatCard({
	title,
	value,
	subtitle,
	icon: Icon,
	gauge,
	trend,
	info,
}: {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: React.ComponentType<{ className?: string }>;
	gauge?: { value: number; max: number; color: string };
	trend?: "up" | "down" | "neutral";
	info?: string;
}) {
	return (
		<Card className="relative overflow-hidden">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
					{title}
					{info && <Info className="h-3 w-3 text-muted-foreground/50" />}
				</CardTitle>
				{Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div>
						<div
							className={cn(
								"font-bold text-2xl tabular-nums",
								trend === "up" && "text-profit",
								trend === "down" && "text-loss",
							)}
						>
							{value}
						</div>
						{subtitle && (
							<p className="mt-1 text-muted-foreground text-xs">{subtitle}</p>
						)}
					</div>
					{gauge && (
						<div className="relative flex items-center justify-center">
							<CircularProgress
								color={gauge.color}
								max={gauge.max}
								size={56}
								strokeWidth={6}
								value={gauge.value}
							/>
							<div className="absolute inset-0 flex items-center justify-center">
								<span className="font-semibold text-xs tabular-nums">
									{Math.round(gauge.value)}%
								</span>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function StatsGrid() {
	const { selectedAccountId } = useAccount();
	const { data: stats, isLoading } = api.trades.getStats.useQuery({
		accountId: selectedAccountId ?? undefined,
	});

	if (isLoading) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
				{[...Array(5)].map((_, i) => (
					<Card key={`skeleton-card-${i.toString()}`}>
						<CardHeader className="pb-2">
							<Skeleton className="h-4 w-20" />
						</CardHeader>
						<CardContent>
							<Skeleton className="mb-2 h-8 w-24" />
							<Skeleton className="h-3 w-16" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!stats) return null;

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
			<StatCard
				icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
				subtitle={`${stats.totalTrades} trades`}
				title="Net P&L"
				trend={stats.totalPnl >= 0 ? "up" : "down"}
				value={formatCurrency(stats.totalPnl)}
			/>
			<StatCard
				gauge={{
					value: stats.winRate,
					max: 100,
					color: stats.winRate >= 50 ? "stroke-profit" : "stroke-loss",
				}}
				subtitle={`${stats.wins}W · ${stats.losses}L · ${stats.breakevens}BE`}
				title="Trade Win %"
				value={`${stats.winRate.toFixed(1)}%`}
			/>
			<StatCard
				gauge={{
					value: Math.min(stats.profitFactor * 33.33, 100), // Scale: 3.0 = 100%
					max: 100,
					color: stats.profitFactor >= 1 ? "stroke-profit" : "stroke-loss",
				}}
				subtitle="Gross P / Gross L"
				title="Profit Factor"
				value={
					stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)
				}
			/>
			<StatCard
				icon={TrendingUp}
				subtitle="Per winning trade"
				title="Avg Win"
				trend="up"
				value={formatCurrency(stats.avgWin)}
			/>
			<StatCard
				icon={TrendingDown}
				subtitle="Per losing trade"
				title="Avg Loss"
				trend="down"
				value={formatCurrency(stats.avgLoss)}
			/>
		</div>
	);
}

function PerformanceSummary() {
	const { selectedAccountId } = useAccount();
	const { data: stats } = api.trades.getStats.useQuery({
		accountId: selectedAccountId ?? undefined,
	});

	if (!stats || stats.totalTrades === 0) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Performance Summary</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Win/Loss Distribution */}
				<div>
					<div className="mb-2 flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Win/Loss Distribution</span>
						<div className="flex items-center gap-3 text-xs">
							<span className="flex items-center gap-1">
								<div className="h-2 w-2 rounded-full bg-profit" />
								{stats.wins}W
							</span>
							<span className="flex items-center gap-1">
								<div className="h-2 w-2 rounded-full bg-yellow-500" />
								{stats.breakevens}BE
							</span>
							<span className="flex items-center gap-1">
								<div className="h-2 w-2 rounded-full bg-loss" />
								{stats.losses}L
							</span>
						</div>
					</div>
					<WinLossBar
						breakevens={stats.breakevens}
						losses={stats.losses}
						wins={stats.wins}
					/>
				</div>

				{/* Key Metrics */}
				<div className="grid grid-cols-2 gap-4 pt-2">
					<div>
						<div className="mb-1 text-muted-foreground text-xs">
							Gross Profit
						</div>
						<div className="font-semibold text-lg text-profit">
							{formatCurrency(stats.grossProfit)}
						</div>
					</div>
					<div>
						<div className="mb-1 text-muted-foreground text-xs">Gross Loss</div>
						<div className="font-semibold text-lg text-loss">
							{formatCurrency(stats.grossLoss)}
						</div>
					</div>
				</div>

				{/* Expectancy */}
				<div className="border-t pt-2">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">Expectancy</span>
						<span
							className={cn(
								"font-mono font-semibold",
								stats.totalTrades > 0
									? getPnLColorClass(stats.totalPnl / stats.totalTrades)
									: "text-muted-foreground",
							)}
						>
							{stats.totalTrades > 0
								? formatCurrency(stats.totalPnl / stats.totalTrades)
								: "-"}
							<span className="ml-1 text-muted-foreground text-xs">/trade</span>
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function EquityCurve() {
	const { selectedAccountId } = useAccount();
	const { data, isLoading } = api.trades.getAll.useQuery({
		status: "closed",
		limit: 200,
		accountId: selectedAccountId ?? undefined,
	});

	const chartOptions = useMemo(() => {
		if (!data?.items) return {};

		let cumulative = 0;
		const trades = data.items
			.filter((t) => t.netPnl)
			.reverse()
			.map((t) => {
				cumulative += parseFloat(t.netPnl ?? "0");
				return {
					date: t.exitTime ? new Date(t.exitTime) : new Date(),
					pnl: cumulative,
				};
			});

		if (trades.length === 0) return {};

		return {
			background: { fill: "transparent" },
			data: trades,
			series: [
				{
					type: "area" as const,
					xKey: "date",
					yKey: "pnl",
					fill: cumulative >= 0 ? "#10b98120" : "#ef444420",
					stroke: cumulative >= 0 ? "#10b981" : "#ef4444",
					strokeWidth: 2,
					marker: { enabled: false },
				},
			],
			axes: [
				{
					type: "time" as const,
					position: "bottom" as const,
					label: { color: "#94a3b8", format: "%b %d" },
					line: { color: "#334155" },
				},
				{
					type: "number" as const,
					position: "left" as const,
					label: {
						color: "#94a3b8",
						formatter: (params: { value: number }) =>
							`$${params.value.toLocaleString()}`,
					},
					line: { color: "#334155" },
					gridLine: { style: [{ stroke: "#1e293b" }] },
				},
			],
		};
	}, [data]);

	if (isLoading) {
		return <Skeleton className="h-[200px] w-full" />;
	}

	if (!data?.items || data.items.length === 0) {
		return (
			<div className="flex h-[200px] items-center justify-center text-muted-foreground">
				<div className="text-center">
					<TrendingUp className="mx-auto mb-2 h-8 w-8 opacity-30" />
					<p>No trade data yet</p>
				</div>
			</div>
		);
	}

	// biome-ignore lint/suspicious/noExplicitAny: ag-charts has complex typing
	return <AgCharts options={chartOptions as any} style={{ height: 200 }} />;
}

function RecentTrades() {
	const { selectedAccountId } = useAccount();
	const { data, isLoading } = api.trades.getAll.useQuery({
		status: "closed",
		limit: 5,
		accountId: selectedAccountId ?? undefined,
	});

	if (isLoading) {
		return (
			<div className="space-y-3">
				{[...Array(5)].map((_, i) => (
					<Skeleton
						className="h-12 w-full"
						key={`skeleton-trade-${i.toString()}`}
					/>
				))}
			</div>
		);
	}

	if (!data?.items || data.items.length === 0) {
		return (
			<div className="flex h-[200px] items-center justify-center text-muted-foreground">
				<div className="text-center">
					<Calendar className="mx-auto mb-2 h-8 w-8 opacity-30" />
					<p>No trades yet</p>
					<Button asChild className="mt-4" size="sm" variant="outline">
						<Link href="/import">Import your first trades</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{data.items.map((trade) => {
				const pnl = parseFloat(trade.netPnl ?? "0");
				return (
					<Link
						className="group flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.05]"
						href={`/journal/${trade.id}`}
						key={trade.id}
					>
						<div className="flex items-center gap-3">
							<Badge
								className="font-mono text-xs"
								variant={trade.direction === "long" ? "default" : "secondary"}
							>
								{trade.direction === "long" ? "L" : "S"}
							</Badge>
							<div>
								<span className="font-medium font-mono">{trade.symbol}</span>
								<p className="text-muted-foreground text-xs">
									{trade.exitTime
										? new Date(trade.exitTime).toLocaleDateString()
										: "-"}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<span
								className={cn(
									"font-bold font-mono",
									pnl >= 0 ? "text-profit" : "text-loss",
								)}
							>
								{pnl >= 0 ? "+" : ""}
								{formatCurrency(pnl)}
							</span>
							<ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
						</div>
					</Link>
				);
			})}
			<Button asChild className="mt-4 w-full" size="sm" variant="ghost">
				<Link href="/journal">View all trades →</Link>
			</Button>
		</div>
	);
}

function TodaySummary() {
	const { selectedAccountId } = useAccount();
	const today = new Date();
	const { data, isLoading } = api.trades.getDailyPnL.useQuery({
		year: today.getFullYear(),
		month: today.getMonth() + 1,
		accountId: selectedAccountId ?? undefined,
	});

	const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
	const todayData = data?.days?.[todayString];

	// Calculate week's data
	const weekStart = new Date(today);
	weekStart.setDate(today.getDate() - today.getDay());
	const weekData = useMemo(() => {
		if (!data?.days) return { pnl: 0, trades: 0, wins: 0, losses: 0 };
		return Object.entries(data.days).reduce(
			(acc, [dateStr, dayData]) => {
				const date = new Date(dateStr);
				if (date >= weekStart && date <= today) {
					acc.pnl += dayData.pnl;
					acc.trades += dayData.trades;
					acc.wins += dayData.wins;
					acc.losses += dayData.losses;
				}
				return acc;
			},
			{ pnl: 0, trades: 0, wins: 0, losses: 0 },
		);
	}, [data, weekStart, today]);

	// Calculate month's data
	const monthData = useMemo(() => {
		if (!data?.days) return { pnl: 0, trades: 0, wins: 0, losses: 0 };
		return Object.values(data.days).reduce(
			(acc, dayData) => {
				acc.pnl += dayData.pnl;
				acc.trades += dayData.trades;
				acc.wins += dayData.wins;
				acc.losses += dayData.losses;
				return acc;
			},
			{ pnl: 0, trades: 0, wins: 0, losses: 0 },
		);
	}, [data]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-20 w-full" />
				<Skeleton className="h-20 w-full" />
				<Skeleton className="h-20 w-full" />
			</div>
		);
	}

	const periods = [
		{
			label: "Today",
			pnl: todayData?.pnl ?? 0,
			trades: todayData?.trades ?? 0,
			wins: todayData?.wins ?? 0,
			losses: todayData?.losses ?? 0,
		},
		{
			label: "This Week",
			...weekData,
		},
		{
			label: "This Month",
			...monthData,
		},
	];

	return (
		<div className="space-y-3">
			{periods.map((period) => (
				<div
					className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4"
					key={period.label}
				>
					<div>
						<p className="font-medium text-sm">{period.label}</p>
						<p className="text-muted-foreground text-xs">
							{period.trades} trade{period.trades !== 1 ? "s" : ""} ·{" "}
							{period.wins}W / {period.losses}L
						</p>
					</div>
					<div className="text-right">
						<p
							className={cn(
								"font-bold font-mono text-lg",
								period.pnl >= 0 ? "text-profit" : "text-loss",
							)}
						>
							{period.pnl >= 0 ? "+" : ""}
							{formatCurrency(period.pnl)}
						</p>
						{period.trades > 0 && (
							<p
								className={cn(
									"font-mono text-xs",
									period.wins / period.trades >= 0.5
										? "text-profit/70"
										: "text-loss/70",
								)}
							>
								{((period.wins / period.trades) * 100).toFixed(0)}% WR
							</p>
						)}
					</div>
				</div>
			))}
		</div>
	);
}

export default function DashboardPage() {
	const { selectedAccount } = useAccount();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Dashboard</h1>
					{selectedAccount && (
						<p className="text-muted-foreground text-sm">
							{selectedAccount.name}
							{selectedAccount.broker && (
								<span className="text-muted-foreground/70">
									{" "}
									· {selectedAccount.broker}
								</span>
							)}
						</p>
					)}
				</div>
			</div>

			{/* Stats Row */}
			<StatsGrid />

			{/* Equity Curve */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<div>
						<CardTitle className="text-base">Equity Curve</CardTitle>
						<CardDescription>Account performance over time</CardDescription>
					</div>
					<Button asChild size="sm" variant="outline">
						<Link href="/analytics">
							View Analytics <ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</CardHeader>
				<CardContent>
					<EquityCurve />
				</CardContent>
			</Card>

			{/* Three Column Grid */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Performance Summary */}
				<PerformanceSummary />

				{/* Today Summary */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Period Summary</CardTitle>
						<CardDescription>Performance by time period</CardDescription>
					</CardHeader>
					<CardContent>
						<TodaySummary />
					</CardContent>
				</Card>

				{/* Recent Trades */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Recent Trades</CardTitle>
						<CardDescription>Your latest closed positions</CardDescription>
					</CardHeader>
					<CardContent>
						<RecentTrades />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
