"use client";

import { SignedIn, SignedOut, SignUpButton, useUser } from "@clerk/nextjs";
import {
	ArrowRight,
	BarChart3,
	Loader2,
	Play,
	Target,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

// Simulated live ticker data
const tickerItems = [
	{ symbol: "ES", price: "5,892.50", change: "+0.43%", positive: true },
	{ symbol: "NQ", price: "21,245.75", change: "+0.67%", positive: true },
	{ symbol: "EUR/USD", price: "1.0892", change: "-0.12%", positive: false },
	{ symbol: "GBP/USD", price: "1.2654", change: "+0.08%", positive: true },
	{ symbol: "CL", price: "72.45", change: "-0.89%", positive: false },
	{ symbol: "GC", price: "2,645.30", change: "+0.34%", positive: true },
	{ symbol: "BTC/USD", price: "104,892", change: "+2.14%", positive: true },
	{ symbol: "USD/JPY", price: "149.82", change: "+0.21%", positive: true },
];

// Demo trades for the preview (for logged out users)
const demoTrades = [
	{ symbol: "ES", direction: "LONG", pnl: 425.0, positive: true },
	{ symbol: "NQ", direction: "SHORT", pnl: -180.0, positive: false },
	{ symbol: "EUR/USD", direction: "LONG", pnl: 312.5, positive: true },
	{ symbol: "ES", direction: "LONG", pnl: 287.0, positive: true },
	{ symbol: "CL", direction: "SHORT", pnl: -95.0, positive: false },
];

// Demo equity curve data points
const demoEquityCurve = [
	0, 425, 245, 557, 844, 749, 1061, 1248, 1153, 1465, 1652, 1557, 1869, 2156,
	2061, 2373, 2560, 2847,
];

function Ticker() {
	return (
		<div className="relative overflow-hidden border-white/5 border-y bg-black/50 py-3">
			<div className="ticker-scroll flex">
				{[...tickerItems, ...tickerItems].map((item, idx) => (
					<div
						className="flex shrink-0 items-center gap-8 px-8"
						key={`${item.symbol}-${idx}`}
					>
						<span className="font-mono text-muted-foreground text-xs">
							{item.symbol}
						</span>
						<span className="font-medium font-mono text-sm">{item.price}</span>
						<span
							className={`font-mono text-xs ${
								item.positive ? "text-profit" : "text-loss"
							}`}
						>
							{item.change}
						</span>
						<span className="text-white/10">│</span>
					</div>
				))}
			</div>
		</div>
	);
}

function AnimatedCounter({
	end,
	suffix = "",
	prefix = "",
	duration = 2000,
}: {
	end: number;
	suffix?: string;
	prefix?: string;
	duration?: number;
}) {
	const [count, setCount] = useState(0);
	const [hasAnimated, setHasAnimated] = useState(false);

	useEffect(() => {
		if (hasAnimated) return;
		const timer = setTimeout(() => {
			setHasAnimated(true);
			const startTime = Date.now();
			const animate = () => {
				const elapsed = Date.now() - startTime;
				const progress = Math.min(elapsed / duration, 1);
				const easeOut = 1 - (1 - progress) ** 3;
				setCount(Math.floor(end * easeOut));
				if (progress < 1) {
					requestAnimationFrame(animate);
				}
			};
			requestAnimationFrame(animate);
		}, 500);
		return () => clearTimeout(timer);
	}, [end, duration, hasAnimated]);

	return (
		<span>
			{prefix}
			{count.toLocaleString()}
			{suffix}
		</span>
	);
}

// Dashboard with real user data
function UserDashboard() {
	const { data: stats, isLoading: statsLoading } = api.trades.getStats.useQuery(
		{},
	);
	const { data: tradesData, isLoading: tradesLoading } =
		api.trades.getAll.useQuery({ limit: 5, status: "closed" });

	const [animatedEquity, setAnimatedEquity] = useState<number[]>([]);

	// Build equity curve from recent trades
	const recentTrades = tradesData?.items ?? [];
	const equityCurve =
		recentTrades.length > 0
			? recentTrades
					.slice()
					.reverse()
					.reduce<number[]>(
						(acc, trade) => {
							const lastValue = acc[acc.length - 1] ?? 0;
							const pnl = parseFloat(trade.netPnl ?? "0");
							acc.push(lastValue + pnl);
							return acc;
						},
						[0],
					)
			: demoEquityCurve;

	const equityCurveKey = equityCurve.join(",");

	useEffect(() => {
		// Animate the equity curve in
		const curve = equityCurveKey.split(",").map(Number);
		curve.forEach((_, index) => {
			setTimeout(() => {
				setAnimatedEquity(curve.slice(0, index + 1));
			}, index * 80);
		});
	}, [equityCurveKey]);

	const maxEquity = Math.max(...equityCurve.map(Math.abs), 1);
	const minEquity = Math.min(...equityCurve, 0);
	const range = maxEquity - minEquity || 1;

	const isLoading = statsLoading || tradesLoading;
	const hasData = stats && stats.totalTrades > 0;

	// Format currency
	const formatPnl = (value: number) => {
		const prefix = value >= 0 ? "+$" : "-$";
		return `${prefix}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	};

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!hasData) {
		// Show empty state with CTA
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
				<div className="rounded-full border border-white/10 bg-white/[0.02] p-4">
					<BarChart3 className="h-8 w-8 text-muted-foreground" />
				</div>
				<div>
					<div className="font-medium font-mono text-sm">No trades yet</div>
					<div className="mt-1 font-mono text-muted-foreground text-xs">
						Import your trades to see your real stats here
					</div>
				</div>
				<Button
					asChild
					className="mt-2 font-mono text-xs uppercase tracking-wider"
					size="sm"
				>
					<Link href="/import">Import Trades</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="grid h-full grid-cols-12 gap-3 p-4">
			{/* Sidebar */}
			<div className="col-span-2 flex flex-col gap-3">
				<div className="rounded border border-white/5 bg-white/[0.02] p-3">
					<div className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
						Your Account
					</div>
					<div className="font-medium font-mono text-primary text-xs">
						Live Data
					</div>
				</div>
				<div className="flex-1 rounded border border-white/5 bg-white/[0.02] p-3">
					<div className="mb-3 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
						Quick Stats
					</div>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="font-mono text-[10px] text-muted-foreground">
								Win Rate
							</span>
							<span
								className={`font-mono text-[10px] ${stats.winRate >= 50 ? "text-profit" : "text-loss"}`}
							>
								{stats.winRate.toFixed(1)}%
							</span>
						</div>
						<div className="flex justify-between">
							<span className="font-mono text-[10px] text-muted-foreground">
								Profit Factor
							</span>
							<span
								className={`font-mono text-[10px] ${stats.profitFactor >= 1 ? "text-profit" : "text-loss"}`}
							>
								{stats.profitFactor.toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="font-mono text-[10px] text-muted-foreground">
								Total Trades
							</span>
							<span className="font-mono text-[10px]">{stats.totalTrades}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="col-span-10 flex flex-col gap-3">
				{/* Stats row */}
				<div className="grid grid-cols-4 gap-3">
					<div className="rounded border border-white/5 bg-white/[0.02] p-3">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Net P&L
							</span>
							{stats.totalPnl >= 0 ? (
								<TrendingUp className="h-3 w-3 text-profit" />
							) : (
								<TrendingDown className="h-3 w-3 text-loss" />
							)}
						</div>
						<div
							className={`mt-1 font-bold font-mono text-lg ${stats.totalPnl >= 0 ? "text-profit" : "text-loss"}`}
						>
							{formatPnl(stats.totalPnl)}
						</div>
						<div className="font-mono text-[10px] text-muted-foreground">
							{stats.totalTrades} trades
						</div>
					</div>
					<div className="rounded border border-white/5 bg-white/[0.02] p-3">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Win Rate
							</span>
							<Target className="h-3 w-3 text-primary" />
						</div>
						<div className="mt-1 font-bold font-mono text-lg">
							{stats.winRate.toFixed(1)}%
						</div>
						<div className="font-mono text-[10px] text-muted-foreground">
							{stats.wins}W · {stats.losses}L
						</div>
					</div>
					<div className="rounded border border-white/5 bg-white/[0.02] p-3">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Avg Win
							</span>
							<TrendingUp className="h-3 w-3 text-profit" />
						</div>
						<div className="mt-1 font-bold font-mono text-lg text-profit">
							{formatPnl(stats.avgWin)}
						</div>
						<div className="font-mono text-[10px] text-muted-foreground">
							{stats.wins} wins
						</div>
					</div>
					<div className="rounded border border-white/5 bg-white/[0.02] p-3">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Avg Loss
							</span>
							<TrendingDown className="h-3 w-3 text-loss" />
						</div>
						<div className="mt-1 font-bold font-mono text-lg text-loss">
							-${stats.avgLoss.toFixed(2)}
						</div>
						<div className="font-mono text-[10px] text-muted-foreground">
							{stats.losses} losses
						</div>
					</div>
				</div>

				{/* Chart and trades */}
				<div className="grid flex-1 grid-cols-3 gap-3">
					{/* Equity curve */}
					<div className="col-span-2 rounded border border-white/5 bg-white/[0.02] p-3">
						<div className="mb-3 flex items-center justify-between">
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Equity Curve
							</span>
							<span
								className={`font-mono text-[10px] ${stats.totalPnl >= 0 ? "text-profit" : "text-loss"}`}
							>
								{formatPnl(stats.totalPnl)}
							</span>
						</div>
						<div className="flex h-32 items-end gap-[2px]">
							{animatedEquity.map((value, i) => {
								const height = ((value - minEquity) / range) * 100;
								const isPositive = value >= 0;
								return (
									<div
										className={`flex-1 rounded-t transition-all duration-300 ${
											isPositive
												? "bg-gradient-to-t from-primary/60 to-primary/30"
												: "bg-gradient-to-t from-loss/60 to-loss/30"
										}`}
										key={`equity-${value.toFixed(2)}-${i}`}
										style={{ height: `${Math.max(height, 2)}%` }}
									/>
								);
							})}
						</div>
					</div>

					{/* Recent trades */}
					<div className="rounded border border-white/5 bg-white/[0.02] p-3">
						<div className="mb-3 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Recent Trades
						</div>
						<div className="space-y-2">
							{recentTrades.slice(0, 5).map((trade) => {
								const pnl = parseFloat(trade.netPnl ?? "0");
								const isPositive = pnl >= 0;
								return (
									<div
										className="flex items-center justify-between rounded bg-white/[0.02] px-2 py-1"
										key={trade.id}
									>
										<div className="flex items-center gap-2">
											<span className="font-mono text-[10px] text-muted-foreground">
												{trade.symbol}
											</span>
											<span
												className={`font-mono text-[10px] ${trade.direction === "long" ? "text-profit" : "text-loss"}`}
											>
												{trade.direction.toUpperCase()}
											</span>
										</div>
										<span
											className={`font-medium font-mono text-[10px] ${isPositive ? "text-profit" : "text-loss"}`}
										>
											{isPositive ? "+" : ""}
											{pnl.toFixed(2)}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Demo dashboard for logged out users
function DemoDashboard() {
	const [animatedEquity, setAnimatedEquity] = useState<number[]>([]);

	useEffect(() => {
		// Animate the equity curve in
		demoEquityCurve.forEach((_, index) => {
			setTimeout(() => {
				setAnimatedEquity(demoEquityCurve.slice(0, index + 1));
			}, index * 100);
		});
	}, []);

	const maxEquity = Math.max(...demoEquityCurve);

	return (
		<div className="grid h-full grid-cols-12 gap-3 p-4">
			{/* Sidebar */}
			<div className="col-span-2 flex flex-col gap-3">
				<div className="rounded border border-white/5 bg-white/[0.02] p-3">
					<div className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
						Account
					</div>
					<div className="font-medium font-mono text-xs">Demo Preview</div>
				</div>
				<div className="flex-1 rounded border border-white/5 bg-white/[0.02] p-3">
					<div className="mb-3 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
						Quick Stats
					</div>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="font-mono text-[10px] text-muted-foreground">
								Win Rate
							</span>
							<span className="font-mono text-[10px] text-profit">68%</span>
						</div>
						<div className="flex justify-between">
							<span className="font-mono text-[10px] text-muted-foreground">
								Profit Factor
							</span>
							<span className="font-mono text-[10px]">2.4</span>
						</div>
						<div className="flex justify-between">
							<span className="font-mono text-[10px] text-muted-foreground">
								Avg RR
							</span>
							<span className="font-mono text-[10px]">1.8:1</span>
						</div>
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="col-span-10 flex flex-col gap-3">
				{/* Stats row */}
				<div className="grid grid-cols-4 gap-3">
					<div className="rounded border border-white/5 bg-white/[0.02] p-3">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Net P&L
							</span>
							<TrendingUp className="h-3 w-3 text-profit" />
						</div>
						<div className="mt-1 font-bold font-mono text-lg text-profit">
							+$2,847.50
						</div>
						<div className="font-mono text-[10px] text-muted-foreground">
							47 trades
						</div>
					</div>
					<div className="rounded border border-white/5 bg-white/[0.02] p-3">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Win Rate
							</span>
							<Target className="h-3 w-3 text-primary" />
						</div>
						<div className="mt-1 font-bold font-mono text-lg">68.1%</div>
						<div className="font-mono text-[10px] text-muted-foreground">
							32W · 15L
						</div>
					</div>
					<div className="rounded border border-white/5 bg-white/[0.02] p-3">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Best Trade
							</span>
							<TrendingUp className="h-3 w-3 text-profit" />
						</div>
						<div className="mt-1 font-bold font-mono text-lg text-profit">
							+$892.00
						</div>
						<div className="font-mono text-[10px] text-muted-foreground">
							ES · Long
						</div>
					</div>
					<div className="rounded border border-white/5 bg-white/[0.02] p-3">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Avg Win
							</span>
							<BarChart3 className="h-3 w-3 text-accent" />
						</div>
						<div className="mt-1 font-bold font-mono text-lg">$187.50</div>
						<div className="font-mono text-[10px] text-muted-foreground">
							vs -$94.20 loss
						</div>
					</div>
				</div>

				{/* Chart and trades */}
				<div className="grid flex-1 grid-cols-3 gap-3">
					{/* Equity curve */}
					<div className="col-span-2 rounded border border-white/5 bg-white/[0.02] p-3">
						<div className="mb-3 flex items-center justify-between">
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Equity Curve
							</span>
							<span className="font-mono text-[10px] text-profit">
								+$2,847.50
							</span>
						</div>
						<div className="flex h-32 items-end gap-[2px]">
							{animatedEquity.map((value, i) => (
								<div
									className="flex-1 rounded-t bg-gradient-to-t from-primary/60 to-primary/30 transition-all duration-300"
									key={`demo-equity-${value.toFixed(2)}-${i}`}
									style={{
										height: `${(value / maxEquity) * 100}%`,
										minHeight: "2px",
									}}
								/>
							))}
						</div>
					</div>

					{/* Recent trades */}
					<div className="rounded border border-white/5 bg-white/[0.02] p-3">
						<div className="mb-3 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Recent Trades
						</div>
						<div className="space-y-2">
							{demoTrades.map((trade) => (
								<div
									className="flex items-center justify-between rounded bg-white/[0.02] px-2 py-1"
									key={`${trade.symbol}-${trade.direction}-${trade.pnl}`}
								>
									<div className="flex items-center gap-2">
										<span className="font-mono text-[10px] text-muted-foreground">
											{trade.symbol}
										</span>
										<span
											className={`font-mono text-[10px] ${trade.direction === "LONG" ? "text-profit" : "text-loss"}`}
										>
											{trade.direction}
										</span>
									</div>
									<span
										className={`font-medium font-mono text-[10px] ${trade.positive ? "text-profit" : "text-loss"}`}
									>
										{trade.positive ? "+" : ""}
										{trade.pnl.toFixed(2)}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Wrapper component to decide which dashboard to show
function DashboardPreview() {
	const { isSignedIn } = useUser();

	return isSignedIn ? <UserDashboard /> : <DemoDashboard />;
}

export function Hero() {
	return (
		<section className="relative min-h-screen overflow-hidden">
			{/* Background layers */}
			<div className="grid-bg absolute inset-0" />
			<div className="scanlines pointer-events-none absolute inset-0" />

			{/* Gradient orbs */}
			<div className="-left-32 absolute top-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
			<div className="-right-32 absolute bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[120px]" />

			{/* Content */}
			<div className="relative flex min-h-screen flex-col pt-16">
				{/* Ticker */}
				<Ticker />

				{/* Main hero content */}
				<div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
					<div className="mx-auto max-w-5xl text-center">
						{/* Status badge */}
						<div className="mb-6 inline-flex items-center gap-3 rounded-none border border-white/10 bg-white/[0.02] px-4 py-2">
							<span className="pulse-dot h-2 w-2 rounded-full bg-profit" />
							<span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
								Now in public beta
							</span>
						</div>

						{/* Main headline */}
						<h1 className="mb-5 font-bold text-4xl leading-[1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
							<span className="block">Find Your</span>
							<span className="block text-glow-primary text-primary">
								Trading Edge
							</span>
						</h1>

						{/* Subheadline */}
						<p className="mx-auto max-w-xl font-mono text-muted-foreground text-sm sm:text-base">
							The AI-powered trading journal for futures and forex traders.
							<br className="hidden sm:block" />
							Track. Analyze. Improve.{" "}
							<span className="text-foreground">Repeat.</span>
						</p>

						{/* CTA buttons */}
						<div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<SignedOut>
								<SignUpButton mode="modal">
									<Button
										className="group h-12 gap-3 px-8 font-mono text-sm uppercase tracking-wider"
										size="lg"
									>
										Start Free
										<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
									</Button>
								</SignUpButton>
							</SignedOut>
							<SignedIn>
								<Button
									asChild
									className="group h-12 gap-3 px-8 font-mono text-sm uppercase tracking-wider"
									size="lg"
								>
									<Link href="/dashboard">
										Go to Dashboard
										<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
									</Link>
								</Button>
							</SignedIn>
							<Button
								asChild
								className="h-12 gap-3 px-8 font-mono text-sm uppercase tracking-wider"
								size="lg"
								variant="outline"
							>
								<a href="#features">
									<Play className="h-4 w-4" />
									Watch Demo
								</a>
							</Button>
						</div>

						{/* Stats row */}
						<div className="mt-12 grid grid-cols-2 gap-6 border-white/5 border-t pt-8 sm:grid-cols-4">
							<div className="text-center">
								<div className="font-bold font-mono text-3xl text-primary sm:text-4xl">
									<AnimatedCounter end={32} prefix="+" suffix="%" />
								</div>
								<div className="mt-2 font-mono text-muted-foreground text-xs uppercase tracking-wider">
									Avg Win Rate Gain
								</div>
							</div>
							<div className="text-center">
								<div className="font-bold font-mono text-3xl sm:text-4xl">
									<AnimatedCounter end={50} suffix="K" />
								</div>
								<div className="mt-2 font-mono text-muted-foreground text-xs uppercase tracking-wider">
									Trades Analyzed
								</div>
							</div>
							<div className="text-center">
								<div className="font-bold font-mono text-3xl text-accent sm:text-4xl">
									<AnimatedCounter end={2} prefix="<" suffix="s" />
								</div>
								<div className="mt-2 font-mono text-muted-foreground text-xs uppercase tracking-wider">
									AI Response Time
								</div>
							</div>
							<div className="text-center">
								<div className="font-bold font-mono text-3xl sm:text-4xl">
									<AnimatedCounter end={99} suffix="%" />
								</div>
								<div className="mt-2 font-mono text-muted-foreground text-xs uppercase tracking-wider">
									Uptime SLA
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Terminal preview section */}
				<div className="mx-auto w-full max-w-5xl px-6 pb-12">
					<div className="overflow-hidden rounded border border-white/10 bg-black/90 shadow-2xl">
						{/* Terminal header */}
						<div className="flex items-center justify-between border-white/5 border-b bg-white/[0.02] px-4 py-2">
							<div className="flex items-center gap-2">
								<div className="h-2.5 w-2.5 rounded-full bg-loss/60" />
								<div className="h-2.5 w-2.5 rounded-full bg-breakeven/60" />
								<div className="h-2.5 w-2.5 rounded-full bg-profit/60" />
							</div>
							<span className="font-mono text-[10px] text-muted-foreground">
								edgejournal — dashboard
							</span>
							<div className="w-14" />
						</div>

						{/* Terminal content */}
						<div className="relative aspect-[16/8] overflow-hidden">
							<DashboardPreview />

							{/* Gradient overlay */}
							<div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
