"use client";

import { Info, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function DashboardPage() {
	const { selectedAccount } = useAccount();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/35 px-3 py-1.5 text-sm backdrop-blur">
						<span className="h-1.5 w-1.5 rounded-full bg-primary" />
						<span className="text-muted-foreground">Overview</span>
					</div>
					<h1 className="mt-3 font-semibold text-3xl tracking-tight">
						Dashboard
					</h1>
					{selectedAccount && (
						<p className="mt-1 text-muted-foreground text-sm">
							<span className="font-medium text-foreground">
								{selectedAccount.name}
							</span>
							{selectedAccount.broker && (
								<span className="text-muted-foreground/70">
									{" "}
									· {selectedAccount.broker}
								</span>
							)}
						</p>
					)}
				</div>

				<Button
					asChild
					className="shadow-primary/15 shadow-sm"
					variant="outline"
				>
					<Link href="/trade/new">Log a trade</Link>
				</Button>
			</div>

			{/* Stats Row */}
			<StatsGrid />

			{/* Performance Summary */}
			<div className="grid gap-6 lg:grid-cols-2">
				<PerformanceSummary />
			</div>
		</div>
	);
}
