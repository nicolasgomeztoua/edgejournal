"use client";

import {
	BarChart3,
	Brain,
	FileSpreadsheet,
	LineChart,
	Shield,
	Sparkles,
	Target,
	TrendingUp,
} from "lucide-react";

const features = [
	{
		icon: LineChart,
		title: "Comprehensive Trade Journal",
		description:
			"Log every aspect of your trades including entry/exit prices, position sizing, stop losses, take profits, and detailed notes on your thought process.",
		color: "text-primary",
	},
	{
		icon: BarChart3,
		title: "Advanced Analytics",
		description:
			"Visualize your performance with equity curves, P&L breakdowns, win rate analysis, time-of-day performance, and risk metrics like Sharpe ratio.",
		color: "text-chart-2",
	},
	{
		icon: Brain,
		title: "AI-Powered Insights",
		description:
			'Ask questions like "Are my stop losses optimal?" or "What\'s my best performing setup?" and get intelligent answers based on your data.',
		color: "text-chart-3",
	},
	{
		icon: FileSpreadsheet,
		title: "CSV Import",
		description:
			"Easily import your historical trades from any broker using CSV files. Map columns to fields and batch import thousands of trades.",
		color: "text-chart-4",
	},
	{
		icon: Target,
		title: "Risk Management Tracking",
		description:
			"Track your planned vs actual stop losses and take profits. Analyze how often you hit your targets and optimize your risk-reward ratios.",
		color: "text-profit",
	},
	{
		icon: Sparkles,
		title: "Setup Classification",
		description:
			"Tag and categorize trades by setup type. See which strategies work best for you and double down on your strengths.",
		color: "text-chart-1",
	},
	{
		icon: TrendingUp,
		title: "Futures & Forex Support",
		description:
			"Purpose-built for futures (ES, NQ, CL) and forex (EUR/USD, GBP/USD) traders with proper lot sizing and pip calculations.",
		color: "text-primary",
	},
	{
		icon: Shield,
		title: "Your Keys, Your Data",
		description:
			"Bring your own AI API keys. Your trading data stays private and is never used to train AI models. Full control, always.",
		color: "text-muted-foreground",
	},
];

export function Features() {
	return (
		<section id="features" className="relative py-24">
			{/* Subtle gradient */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />

			<div className="container relative mx-auto px-4">
				{/* Section header */}
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
						Everything you need to{" "}
						<span className="text-primary">level up</span> your trading
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						A complete toolkit designed for serious traders who want to find
						their edge and consistently improve.
					</p>
				</div>

				{/* Features grid */}
				<div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{features.map((feature, index) => (
						<div
							key={feature.title}
							className="group relative rounded-xl border border-border/50 bg-card/50 p-6 transition-all hover:border-border hover:bg-card"
							style={{
								animationDelay: `${index * 100}ms`,
							}}
						>
							<feature.icon className={`h-10 w-10 ${feature.color}`} />
							<h3 className="mt-4 font-semibold">{feature.title}</h3>
							<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

