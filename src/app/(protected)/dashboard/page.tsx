"use client";

import {
	ArrowDownRight,
	ArrowUpRight,
	BarChart3,
	Calendar,
	Target,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarHeatmap } from "@/components/ui/calendar-heatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DateRangePicker,
	type DateRange,
	dateRangePresets,
} from "@/components/ui/date-range-picker";
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
	className,
}: {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: React.ComponentType<{ className?: string }>;
	gauge?: { value: number; max: number; color: string };
	trend?: "up" | "down" | "neutral";
	className?: string;
}) {
	return (
		<Card className={cn("relative overflow-hidden", className)}>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
					{title}
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

function RecentTradesCard({
	accountId,
	dateRange,
}: {
	accountId: number | null;
	dateRange: DateRange | undefined;
}) {
	const { data: tradesData, isLoading } = api.trades.getAll.useQuery({
		limit: 5,
		status: "closed",
		accountId: accountId ?? undefined,
		startDate: dateRange?.from.toISOString(),
		endDate: dateRange?.to.toISOString(),
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between text-base">
						Recent Trades
						<Link
							className="font-normal text-muted-foreground text-sm hover:text-foreground"
							href="/journal"
						>
							View all →
						</Link>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton className="h-12" key={`skeleton-trade-${i}`} />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const trades = tradesData?.items ?? [];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between text-base">
					Recent Trades
					<Link
						className="font-normal text-muted-foreground text-sm hover:text-foreground"
						href="/journal"
					>
						View all →
					</Link>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{trades.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<BarChart3 className="mb-3 h-8 w-8 text-muted-foreground/50" />
						<p className="text-muted-foreground text-sm">No trades yet</p>
						<Link
							className="mt-2 text-primary text-sm hover:underline"
							href="/trade/new"
						>
							Log your first trade
						</Link>
					</div>
				) : (
					<div className="space-y-2">
						{trades.map((trade) => {
							const pnl = trade.netPnl ? parseFloat(trade.netPnl) : 0;
							return (
								<Link
									className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
									href={`/journal/${trade.id}`}
									key={trade.id}
								>
									<div className="flex items-center gap-3">
										<div
											className={cn(
												"flex h-8 w-8 items-center justify-center rounded",
												trade.direction === "long"
													? "bg-profit/10"
													: "bg-loss/10",
											)}
										>
											{trade.direction === "long" ? (
												<ArrowUpRight className="h-4 w-4 text-profit" />
											) : (
												<ArrowDownRight className="h-4 w-4 text-loss" />
											)}
										</div>
										<div>
											<div className="flex items-center gap-2">
												<span className="font-mono font-semibold text-sm">
													{trade.symbol}
												</span>
												<span
													className={cn(
														"font-mono text-xs",
														trade.direction === "long"
															? "text-profit"
															: "text-loss",
													)}
												>
													{trade.direction.toUpperCase()}
												</span>
											</div>
											<div className="text-muted-foreground text-xs">
												{trade.exitTime
													? new Date(trade.exitTime).toLocaleDateString()
													: "Open"}
											</div>
										</div>
									</div>
									<span
										className={cn("font-mono font-semibold", getPnLColorClass(pnl))}
									>
										{pnl >= 0 ? "+" : ""}
										{formatCurrency(pnl)}
									</span>
								</Link>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function SymbolBreakdown({
	accountId,
	dateRange,
}: {
	accountId: number | null;
	dateRange: DateRange | undefined;
}) {
	const { data: symbolStats, isLoading } = api.trades.getSymbolStats.useQuery({
		accountId: accountId ?? undefined,
		startDate: dateRange?.from.toISOString(),
		endDate: dateRange?.to.toISOString(),
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Symbol Performance</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton className="h-10" key={`skeleton-symbol-${i}`} />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const symbols = symbolStats?.slice(0, 6) ?? [];
	const maxAbsPnl = symbols.reduce(
		(max, s) => Math.max(max, Math.abs(s.pnl)),
		1,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Symbol Performance</CardTitle>
			</CardHeader>
			<CardContent>
				{symbols.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground text-sm">
						No symbol data yet
					</div>
				) : (
					<div className="space-y-3">
						{symbols.map((s) => {
							const width = (Math.abs(s.pnl) / maxAbsPnl) * 100;
							return (
								<div
									className="flex items-center justify-between"
									key={s.symbol}
								>
									<div className="flex items-center gap-3">
										<span className="w-16 font-mono text-sm">{s.symbol}</span>
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
									<div className="flex items-center gap-4">
										<span className="text-muted-foreground text-xs">
											{s.trades} trades
										</span>
										<span className="text-muted-foreground text-xs">
											{s.winRate.toFixed(0)}% WR
										</span>
										<span
											className={cn(
												"w-20 text-right font-mono text-sm",
												s.pnl >= 0 ? "text-profit" : "text-loss",
											)}
										>
											{s.pnl >= 0 ? "+" : ""}
											{formatCurrency(s.pnl)}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function DayOfWeekChart({
	accountId,
	dateRange,
}: {
	accountId: number | null;
	dateRange: DateRange | undefined;
}) {
	const { data: dayStats, isLoading } = api.trades.getDayOfWeekStats.useQuery({
		accountId: accountId ?? undefined,
		startDate: dateRange?.from.toISOString(),
		endDate: dateRange?.to.toISOString(),
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Performance by Day</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-32" />
				</CardContent>
			</Card>
		);
	}

	const days = dayStats ?? [];
	const maxAbsPnl = days.reduce((max, d) => Math.max(max, Math.abs(d.pnl)), 1);

	// Filter to trading days only (Mon-Fri)
	const tradingDays = days.filter((_d, i) => i >= 1 && i <= 5);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Performance by Day</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-end justify-between gap-2">
					{tradingDays.map((day) => {
						const height = (Math.abs(day.pnl) / maxAbsPnl) * 100;
						return (
							<div
								className="flex flex-1 flex-col items-center gap-2"
								key={day.day}
							>
								<div className="flex h-24 w-full items-end justify-center">
									<div
										className={cn(
											"w-full max-w-10 rounded-t transition-all",
											day.pnl >= 0 ? "bg-profit/60" : "bg-loss/60",
										)}
										style={{ height: `${Math.max(height, 4)}%` }}
									/>
								</div>
								<div className="text-center">
									<div className="font-mono text-muted-foreground text-xs">
										{day.day.slice(0, 3)}
									</div>
									<div
										className={cn(
											"font-mono text-xs",
											day.pnl >= 0 ? "text-profit" : "text-loss",
										)}
									>
										{day.pnl >= 0 ? "+" : ""}
										{day.pnl.toFixed(0)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

export default function DashboardPage() {
	const { selectedAccount, selectedAccountId } = useAccount();
	const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
		const preset = dateRangePresets.find((p) => p.key === "thisMonth");
		return preset?.getRange();
	});

	const statsInput = useMemo(
		() => ({
			accountId: selectedAccountId ?? undefined,
			startDate: dateRange?.from.toISOString(),
			endDate: dateRange?.to.toISOString(),
		}),
		[selectedAccountId, dateRange],
	);

	const { data: stats, isLoading: statsLoading } =
		api.trades.getStats.useQuery(statsInput);
	const { data: dailyPnL, isLoading: dailyLoading } =
		api.trades.getDailyPnL.useQuery({
			accountId: selectedAccountId ?? undefined,
		});

	const calendarData = useMemo(() => {
		return (dailyPnL ?? []).map((d) => ({
			date: new Date(d.date),
			pnl: d.pnl,
			trades: d.trades,
		}));
	}, [dailyPnL]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
				<DateRangePicker onChange={setDateRange} value={dateRange} />
			</div>

			{/* Stats Row */}
			{statsLoading ? (
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
			) : stats ? (
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
						title="Win Rate"
						value={`${stats.winRate.toFixed(1)}%`}
					/>
					<StatCard
						gauge={{
							value: Math.min(stats.profitFactor * 33.33, 100),
							max: 100,
							color: stats.profitFactor >= 1 ? "stroke-profit" : "stroke-loss",
						}}
						subtitle="Gross P / Gross L"
						title="Profit Factor"
						value={
							stats.profitFactor === Infinity
								? "∞"
								: stats.profitFactor.toFixed(2)
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
			) : null}

			{/* Secondary Stats Row */}
			{stats && stats.totalTrades > 0 && (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard
						icon={Target}
						subtitle={`${stats.wins + stats.losses + stats.breakevens} decisive`}
						title="Expectancy"
						trend={
							stats.totalTrades > 0
								? stats.totalPnl / stats.totalTrades >= 0
									? "up"
									: "down"
								: "neutral"
						}
						value={
							stats.totalTrades > 0
								? formatCurrency(stats.totalPnl / stats.totalTrades)
								: "-"
						}
					/>
					<StatCard
						subtitle="Total winning trades"
						title="Gross Profit"
						trend="up"
						value={formatCurrency(stats.grossProfit)}
					/>
					<StatCard
						subtitle="Total losing trades"
						title="Gross Loss"
						trend="down"
						value={formatCurrency(stats.grossLoss)}
					/>
					<StatCard
						subtitle={`±$${stats.breakevenThreshold.toFixed(2)} threshold`}
						title="Breakeven Trades"
						value={stats.breakevens}
					/>
				</div>
			)}

			{/* Calendar Heatmap */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<Calendar className="h-4 w-4" />
						P&L Calendar
					</CardTitle>
				</CardHeader>
				<CardContent>
					{dailyLoading ? (
						<Skeleton className="h-[350px]" />
					) : (
						<CalendarHeatmap data={calendarData} />
					)}
				</CardContent>
			</Card>

			{/* Main Content Grid */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Recent Trades */}
				<RecentTradesCard accountId={selectedAccountId} dateRange={dateRange} />

				{/* Performance Summary */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Performance Summary</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{stats && stats.totalTrades > 0 ? (
							<>
								{/* Win/Loss Distribution */}
								<div>
									<div className="mb-2 flex items-center justify-between text-sm">
										<span className="text-muted-foreground">
											Win/Loss Distribution
										</span>
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
										<div className="mb-1 text-muted-foreground text-xs">
											Gross Loss
										</div>
										<div className="font-semibold text-lg text-loss">
											{formatCurrency(stats.grossLoss)}
										</div>
									</div>
								</div>

								{/* Risk/Reward */}
								<div className="border-t pt-4">
									<div className="mb-2 text-muted-foreground text-xs">
										Risk/Reward Analysis
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="flex items-center justify-between">
											<span className="text-sm">Avg Win/Loss</span>
											<span className="font-mono text-sm">
												{stats.avgLoss > 0
													? (stats.avgWin / stats.avgLoss).toFixed(2)
													: "∞"}
												:1
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm">Profit Factor</span>
											<span
												className={cn(
													"font-mono text-sm",
													stats.profitFactor >= 1.5
														? "text-profit"
														: stats.profitFactor >= 1
															? "text-yellow-500"
															: "text-loss",
												)}
											>
												{stats.profitFactor.toFixed(2)}
											</span>
										</div>
									</div>
								</div>
							</>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<TrendingUp className="mb-3 h-8 w-8 text-muted-foreground/50" />
								<p className="text-muted-foreground text-sm">
									No trade data for this period
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Symbol & Day Analysis */}
			<div className="grid gap-6 lg:grid-cols-2">
				<SymbolBreakdown accountId={selectedAccountId} dateRange={dateRange} />
				<DayOfWeekChart accountId={selectedAccountId} dateRange={dateRange} />
			</div>
		</div>
	);
}
