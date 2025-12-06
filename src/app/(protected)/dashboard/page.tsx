"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
	TrendingUp,
	TrendingDown,
	Info,
} from "lucide-react";
import { api } from "@/trpc/react";
import { formatCurrency, formatPercent, getPnLColorClass, cn } from "@/lib/utils";
import { useAccount } from "@/contexts/account-context";

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
		<svg width={size} height={size} className="transform -rotate-90">
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				strokeWidth={strokeWidth}
				className={bgColor}
			/>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeDasharray={circumference}
				strokeDashoffset={offset}
				className={cn(color, "transition-all duration-500")}
			/>
		</svg>
	);
}

// Mini bar for win/loss visualization
function WinLossBar({ wins, losses, breakevens }: { wins: number; losses: number; breakevens: number }) {
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
				<CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
					{title}
					{info && (
						<Info className="h-3 w-3 text-muted-foreground/50" />
					)}
				</CardTitle>
				{Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div>
						<div className={cn(
							"text-2xl font-bold tabular-nums",
							trend === "up" && "text-profit",
							trend === "down" && "text-loss",
						)}>
							{value}
						</div>
						{subtitle && (
							<p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
						)}
					</div>
					{gauge && (
						<div className="relative flex items-center justify-center">
							<CircularProgress 
								value={gauge.value} 
								max={gauge.max} 
								size={56}
								strokeWidth={6}
								color={gauge.color}
							/>
							<div className="absolute inset-0 flex items-center justify-center">
								<span className="text-xs font-semibold tabular-nums">
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
					<Card key={i}>
						<CardHeader className="pb-2">
							<Skeleton className="h-4 w-20" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-24 mb-2" />
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
				title="Net P&L"
				value={formatCurrency(stats.totalPnl)}
				subtitle={`${stats.totalTrades} trades`}
				icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
				trend={stats.totalPnl >= 0 ? "up" : "down"}
			/>
			<StatCard
				title="Trade Win %"
				value={`${stats.winRate.toFixed(1)}%`}
				subtitle={`${stats.wins}W · ${stats.losses}L · ${stats.breakevens}BE`}
				gauge={{ 
					value: stats.winRate, 
					max: 100,
					color: stats.winRate >= 50 ? "stroke-profit" : "stroke-loss"
				}}
			/>
			<StatCard
				title="Profit Factor"
				value={stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}
				subtitle="Gross P / Gross L"
				gauge={{ 
					value: Math.min(stats.profitFactor * 33.33, 100), // Scale: 3.0 = 100%
					max: 100,
					color: stats.profitFactor >= 1 ? "stroke-profit" : "stroke-loss"
				}}
			/>
			<StatCard
				title="Avg Win"
				value={formatCurrency(stats.avgWin)}
				subtitle="Per winning trade"
				icon={TrendingUp}
				trend="up"
			/>
			<StatCard
				title="Avg Loss"
				value={formatCurrency(stats.avgLoss)}
				subtitle="Per losing trade"
				icon={TrendingDown}
				trend="down"
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
					<div className="flex items-center justify-between text-sm mb-2">
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
					<WinLossBar wins={stats.wins} losses={stats.losses} breakevens={stats.breakevens} />
				</div>

				{/* Key Metrics */}
				<div className="grid grid-cols-2 gap-4 pt-2">
					<div>
						<div className="text-xs text-muted-foreground mb-1">Gross Profit</div>
						<div className="text-lg font-semibold text-profit">
							{formatCurrency(stats.grossProfit)}
						</div>
					</div>
					<div>
						<div className="text-xs text-muted-foreground mb-1">Gross Loss</div>
						<div className="text-lg font-semibold text-loss">
							{formatCurrency(stats.grossLoss)}
						</div>
					</div>
				</div>

				{/* Expectancy */}
				<div className="pt-2 border-t">
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Expectancy</span>
						<span className={cn(
							"font-mono font-semibold",
							stats.totalTrades > 0 
								? getPnLColorClass(stats.totalPnl / stats.totalTrades)
								: "text-muted-foreground"
						)}>
							{stats.totalTrades > 0 
								? formatCurrency(stats.totalPnl / stats.totalTrades)
								: "-"
							}
							<span className="text-xs text-muted-foreground ml-1">/trade</span>
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
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
					{selectedAccount && (
						<p className="text-sm text-muted-foreground">
							{selectedAccount.name}
							{selectedAccount.broker && (
								<span className="text-muted-foreground/70"> · {selectedAccount.broker}</span>
							)}
						</p>
					)}
				</div>
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
