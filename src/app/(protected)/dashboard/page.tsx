"use client";

import {
	Activity,
	ArrowDownRight,
	ArrowUpRight,
	BarChart3,
	Scale,
	Target,
	TrendingDown,
	TrendingUp,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "@/contexts/account-context";
import { cn, formatCurrency, getPnLColorClass } from "@/lib/utils";
import { api } from "@/trpc/react";

// Enhanced circular progress with glow effect
function CircularProgress({
	value,
	max = 100,
	size = 72,
	strokeWidth = 6,
	colorClass = "text-primary",
	glowColor = "rgba(212, 255, 0, 0.3)",
}: {
	value: number;
	max?: number;
	size?: number;
	strokeWidth?: number;
	colorClass?: string;
	glowColor?: string;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const percent = Math.min(Math.max(value / max, 0), 1);
	const offset = circumference - percent * circumference;

	return (
		<div className="relative" style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}>
			<svg
				aria-hidden="true"
				className="-rotate-90 transform"
				height={size}
				width={size}
			>
				<title>Progress indicator</title>
				{/* Background track */}
				<circle
					className="stroke-white/[0.06]"
					cx={size / 2}
					cy={size / 2}
					fill="none"
					r={radius}
					strokeWidth={strokeWidth}
				/>
				{/* Progress arc */}
				<circle
					className={cn("transition-all duration-700 ease-out", colorClass)}
					cx={size / 2}
					cy={size / 2}
					fill="none"
					r={radius}
					stroke="currentColor"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					strokeWidth={strokeWidth}
				/>
			</svg>
		</div>
	);
}

// Improved win/loss bar with rounded segments
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
		<div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
			{winPercent > 0 && (
				<div
					className="rounded-full bg-gradient-to-r from-profit/80 to-profit transition-all duration-500"
					style={{ width: `${winPercent}%` }}
				/>
			)}
			{bePercent > 0 && (
				<div
					className="rounded-full bg-gradient-to-r from-breakeven/80 to-breakeven transition-all duration-500"
					style={{ width: `${bePercent}%` }}
				/>
			)}
			{lossPercent > 0 && (
				<div
					className="rounded-full bg-gradient-to-r from-loss/80 to-loss transition-all duration-500"
					style={{ width: `${lossPercent}%` }}
				/>
			)}
		</div>
	);
}

// Enhanced stat card with gradients and better visual hierarchy
function StatCard({
	title,
	value,
	subtitle,
	icon: Icon,
	gauge,
	trend,
	accentColor = "primary",
}: {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: React.ComponentType<{ className?: string }>;
	gauge?: { value: number; max: number; colorClass: string; glowColor: string };
	trend?: "up" | "down" | "neutral";
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
				"hover:shadow-lg hover:shadow-black/20 hover:border-opacity-50",
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

			<div className="relative flex items-start justify-between">
				<div className="flex-1">
					{/* Title row with icon */}
					<div className="mb-3 flex items-center gap-2">
						{Icon && (
							<div className={cn("flex h-7 w-7 items-center justify-center rounded-md", iconBgClasses[accentColor])}>
								<Icon className="h-3.5 w-3.5" />
							</div>
						)}
						<span className="font-mono text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
							{title}
						</span>
					</div>

					{/* Value */}
					<div
						className={cn(
							"font-bold font-mono text-2xl tracking-tight",
							trend === "up" && "text-profit",
							trend === "down" && "text-loss",
							!trend && "text-foreground",
						)}
					>
						{value}
					</div>

					{/* Subtitle */}
					{subtitle && (
						<p className="mt-1.5 font-mono text-xs text-muted-foreground/80">
							{subtitle}
						</p>
					)}
				</div>

				{/* Gauge */}
				{gauge && (
					<div className="relative flex flex-col items-center">
						<CircularProgress
							colorClass={gauge.colorClass}
							glowColor={gauge.glowColor}
							max={gauge.max}
							size={64}
							strokeWidth={5}
							value={gauge.value}
						/>
						<div className="absolute inset-0 flex items-center justify-center">
							<span className="font-mono font-bold text-sm">
								{Math.round(gauge.value)}%
							</span>
						</div>
					</div>
				)}

				{/* Trend indicator (if no gauge) */}
				{!gauge && trend && (
					<div
						className={cn(
							"flex h-10 w-10 items-center justify-center rounded-full",
							trend === "up" && "bg-profit/10",
							trend === "down" && "bg-loss/10",
						)}
					>
						{trend === "up" ? (
							<ArrowUpRight className="h-5 w-5 text-profit" />
						) : (
							<ArrowDownRight className="h-5 w-5 text-loss" />
						)}
					</div>
				)}
			</div>
		</div>
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
					<div
						className="rounded-lg border border-white/10 bg-white/[0.02] p-5"
						key={`skeleton-card-${i.toString()}`}
					>
						<div className="flex items-center gap-2 mb-3">
							<Skeleton className="h-7 w-7 rounded-md" />
							<Skeleton className="h-3 w-16" />
						</div>
						<Skeleton className="mb-2 h-7 w-24" />
						<Skeleton className="h-3 w-16" />
					</div>
				))}
			</div>
		);
	}

	if (!stats) return null;

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
			<StatCard
				accentColor={stats.totalPnl >= 0 ? "profit" : "loss"}
				icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
				subtitle={`${stats.totalTrades} closed trades`}
				title="Net P&L"
				trend={stats.totalPnl >= 0 ? "up" : "down"}
				value={formatCurrency(stats.totalPnl)}
			/>
			<StatCard
				accentColor={stats.winRate >= 50 ? "profit" : "loss"}
				gauge={{
					value: stats.winRate,
					max: 100,
					colorClass: stats.winRate >= 50 ? "text-profit" : "text-loss",
					glowColor: stats.winRate >= 50 ? "rgba(0, 255, 136, 0.3)" : "rgba(255, 59, 59, 0.3)",
				}}
				icon={Target}
				subtitle={`${stats.wins}W · ${stats.losses}L · ${stats.breakevens}BE`}
				title="Win Rate"
				value={`${stats.winRate.toFixed(1)}%`}
			/>
			<StatCard
				accentColor={stats.profitFactor >= 1 ? "profit" : "loss"}
				gauge={{
					value: Math.min(stats.profitFactor * 33.33, 100),
					max: 100,
					colorClass: stats.profitFactor >= 1 ? "text-profit" : "text-loss",
					glowColor: stats.profitFactor >= 1 ? "rgba(0, 255, 136, 0.3)" : "rgba(255, 59, 59, 0.3)",
				}}
				icon={Scale}
				subtitle="Gross profit / loss ratio"
				title="Profit Factor"
				value={
					stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)
				}
			/>
			<StatCard
				accentColor="profit"
				icon={ArrowUpRight}
				subtitle="Per winning trade"
				title="Avg Win"
				trend="up"
				value={formatCurrency(stats.avgWin)}
			/>
			<StatCard
				accentColor="loss"
				icon={ArrowDownRight}
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

	if (!stats || stats.totalTrades === 0) {
		return (
			<div className="overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
				{/* Terminal header */}
				<div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-2.5">
					<div className="flex items-center gap-1.5">
						<div className="h-2.5 w-2.5 rounded-full bg-loss/50" />
						<div className="h-2.5 w-2.5 rounded-full bg-breakeven/50" />
						<div className="h-2.5 w-2.5 rounded-full bg-profit/50" />
					</div>
					<span className="font-mono text-[10px] text-muted-foreground/70">
						performance-summary
					</span>
					<div className="w-14" />
				</div>

				{/* Empty state */}
				<div className="flex flex-col items-center justify-center py-16 px-6 text-center">
					<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
						<BarChart3 className="h-6 w-6 text-muted-foreground/40" />
					</div>
					<h3 className="mb-2 font-semibold text-base">No performance data yet</h3>
					<p className="mb-5 font-mono text-xs text-muted-foreground max-w-[280px]">
						Start logging trades to see your performance metrics and analytics.
					</p>
					<Link
						href="/journal"
						className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-mono text-xs font-medium text-primary-foreground uppercase tracking-wider transition-all hover:bg-primary/90"
					>
						<Zap className="h-3.5 w-3.5" />
						Log Your First Trade
					</Link>
				</div>
			</div>
		);
	}

	const expectancy = stats.totalTrades > 0 ? stats.totalPnl / stats.totalTrades : 0;

	return (
		<div className="overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
			{/* Terminal header */}
			<div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-2.5">
				<div className="flex items-center gap-1.5">
					<div className="h-2.5 w-2.5 rounded-full bg-loss/50 shadow-[0_0_6px_rgba(255,59,59,0.5)]" />
					<div className="h-2.5 w-2.5 rounded-full bg-breakeven/50 shadow-[0_0_6px_rgba(255,215,0,0.5)]" />
					<div className="h-2.5 w-2.5 rounded-full bg-profit/50 shadow-[0_0_6px_rgba(0,255,136,0.5)]" />
				</div>
				<span className="font-mono text-[10px] text-muted-foreground/70">
					performance-summary
				</span>
				<div className="w-14" />
			</div>

			{/* Content */}
			<div className="p-5 space-y-5">
				{/* Win/Loss Distribution */}
				<div>
					<div className="mb-3 flex items-center justify-between">
						<span className="font-mono text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
							Win/Loss Distribution
						</span>
						<div className="flex items-center gap-4 font-mono text-[11px]">
							<span className="flex items-center gap-1.5">
								<div className="h-2.5 w-2.5 rounded-full bg-profit shadow-[0_0_6px_rgba(0,255,136,0.5)]" />
								<span className="text-profit font-medium">{stats.wins}W</span>
							</span>
							<span className="flex items-center gap-1.5">
								<div className="h-2.5 w-2.5 rounded-full bg-breakeven shadow-[0_0_6px_rgba(255,215,0,0.5)]" />
								<span className="text-breakeven font-medium">{stats.breakevens}BE</span>
							</span>
							<span className="flex items-center gap-1.5">
								<div className="h-2.5 w-2.5 rounded-full bg-loss shadow-[0_0_6px_rgba(255,59,59,0.5)]" />
								<span className="text-loss font-medium">{stats.losses}L</span>
							</span>
						</div>
					</div>
					<WinLossBar
						breakevens={stats.breakevens}
						losses={stats.losses}
						wins={stats.wins}
					/>
				</div>

				{/* Key Metrics Grid */}
				<div className="grid grid-cols-2 gap-4 pt-1">
					<div className="rounded-lg border border-profit/20 bg-profit/[0.05] p-4">
						<div className="font-mono text-[10px] font-medium text-profit/70 uppercase tracking-wider mb-1.5">
							Gross Profit
						</div>
						<div className="font-bold font-mono text-xl text-profit">
							{formatCurrency(stats.grossProfit)}
						</div>
					</div>
					<div className="rounded-lg border border-loss/20 bg-loss/[0.05] p-4">
						<div className="font-mono text-[10px] font-medium text-loss/70 uppercase tracking-wider mb-1.5">
							Gross Loss
						</div>
						<div className="font-bold font-mono text-xl text-loss">
							{formatCurrency(stats.grossLoss)}
						</div>
					</div>
				</div>

				{/* Expectancy */}
				<div className="border-t border-white/10 pt-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10">
								<Activity className="h-4 w-4 text-accent" />
							</div>
							<div>
								<span className="font-mono text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
									Expectancy
								</span>
								<span className="font-mono text-[10px] text-muted-foreground/60">
									Average return per trade
								</span>
							</div>
						</div>
						<div className="text-right">
							<span
								className={cn(
									"font-bold font-mono text-lg",
									getPnLColorClass(expectancy),
								)}
							>
								{formatCurrency(expectancy)}
							</span>
							<span className="font-mono text-muted-foreground text-[10px] block">
								per trade
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Quick Actions Card
function QuickActions() {
	return (
		<div className="overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
			{/* Terminal header */}
			<div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-2.5">
				<div className="flex items-center gap-1.5">
					<div className="h-2.5 w-2.5 rounded-full bg-loss/50" />
					<div className="h-2.5 w-2.5 rounded-full bg-breakeven/50" />
					<div className="h-2.5 w-2.5 rounded-full bg-profit/50" />
				</div>
				<span className="font-mono text-[10px] text-muted-foreground/70">
					quick-actions
				</span>
				<div className="w-14" />
			</div>

			<div className="p-5 space-y-3">
				<Link
					href="/trade/new"
					className="group flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.05] p-4 transition-all hover:border-primary/40 hover:bg-primary/10"
				>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary transition-transform group-hover:scale-110">
						<Zap className="h-5 w-5" />
					</div>
					<div>
						<span className="font-mono text-sm font-medium block">Log New Trade</span>
						<span className="font-mono text-[10px] text-muted-foreground">
							Manually enter trade details
						</span>
					</div>
				</Link>

				<Link
					href="/import"
					className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-white/20 hover:bg-white/[0.04]"
				>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-muted-foreground transition-transform group-hover:scale-110">
						<BarChart3 className="h-5 w-5" />
					</div>
					<div>
						<span className="font-mono text-sm font-medium block">Import CSV</span>
						<span className="font-mono text-[10px] text-muted-foreground">
							Bulk import from broker
						</span>
					</div>
				</Link>

				<Link
					href="/analytics"
					className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-white/20 hover:bg-white/[0.04]"
				>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-muted-foreground transition-transform group-hover:scale-110">
						<Activity className="h-5 w-5" />
					</div>
					<div>
						<span className="font-mono text-sm font-medium block">View Analytics</span>
						<span className="font-mono text-[10px] text-muted-foreground">
							Charts & performance insights
						</span>
					</div>
				</Link>
			</div>
		</div>
	);
}

export default function DashboardPage() {
	const { selectedAccount } = useAccount();

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div>
					<div className="flex items-center gap-3 mb-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<BarChart3 className="h-5 w-5 text-primary" />
						</div>
						<span className="font-mono text-primary text-xs font-medium uppercase tracking-wider">
							Dashboard
						</span>
					</div>
					<h1 className="font-bold text-4xl tracking-tight">
						Trading Overview
					</h1>
					{selectedAccount && (
						<p className="mt-2 font-mono text-muted-foreground text-sm">
							<span className="text-foreground/80 font-medium">{selectedAccount.name}</span>
							{selectedAccount.broker && (
								<span className="text-muted-foreground/60">
									{" · "}{selectedAccount.broker}
								</span>
							)}
						</p>
					)}
				</div>
			</div>

			{/* Stats Row */}
			<StatsGrid />

			{/* Two Column Layout */}
			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<PerformanceSummary />
				</div>
				<QuickActions />
			</div>
		</div>
	);
}
