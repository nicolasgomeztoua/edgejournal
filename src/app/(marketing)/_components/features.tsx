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
import { Card } from "@/components/ui/card";

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
		<section className="relative py-20 sm:py-24" id="features">
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-card/25 to-background" />
			<div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-grid-fine landing-mask-fade-y" />

			<div className="container relative mx-auto px-4">
				<div className="mx-auto max-w-2xl text-center">
					<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-sm backdrop-blur">
						<Sparkles className="h-4 w-4 text-primary" />
						<span className="text-muted-foreground">
							A workflow that compounds
						</span>
					</div>
					<h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
						Build an edge you can actually repeat
					</h2>
					<p className="mt-4 text-base text-muted-foreground leading-relaxed sm:text-lg">
						Log context, measure outcomes, then tighten your rules. EdgeJournal
						is built around a simple loop that turns trades into decisions you
						can trust.
					</p>
				</div>

				<div className="mt-12 grid gap-6 lg:grid-cols-3">
					<Card className="border-border/60 bg-card/40 p-6 backdrop-blur">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
								<FileSpreadsheet className="h-5 w-5 text-primary" />
							</div>
							<div>
								<div className="text-muted-foreground text-xs">01</div>
								<div className="font-medium">Capture reality</div>
							</div>
						</div>
						<p className="mt-4 text-muted-foreground text-sm leading-relaxed">
							Manual entry or CSV import—track entries, exits, rules, emotions,
							and screenshots. Don’t just store trades; store context.
						</p>
					</Card>

					<Card className="border-border/60 bg-card/40 p-6 backdrop-blur">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/15">
								<BarChart3 className="h-5 w-5 text-chart-2" />
							</div>
							<div>
								<div className="text-muted-foreground text-xs">02</div>
								<div className="font-medium">See patterns</div>
							</div>
						</div>
						<p className="mt-4 text-muted-foreground text-sm leading-relaxed">
							Segment by setup, time, instrument, and risk. Find the 20% that
							drives your P&amp;L and the leaks that keep repeating.
						</p>
					</Card>

					<Card className="border-border/60 bg-card/40 p-6 backdrop-blur">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/15">
								<Brain className="h-5 w-5 text-chart-3" />
							</div>
							<div>
								<div className="text-muted-foreground text-xs">03</div>
								<div className="font-medium">Pressure-test with AI</div>
							</div>
						</div>
						<p className="mt-4 text-muted-foreground text-sm leading-relaxed">
							Ask natural-language questions about your own data. Get hypotheses
							fast, then validate them with charts and filters.
						</p>
					</Card>
				</div>

				{/* Feature grid */}
				<div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{features.map((feature) => (
						<div
							className="group relative rounded-2xl border border-border/60 bg-card/35 p-6 backdrop-blur transition-colors hover:bg-card/55"
							key={feature.title}
						>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/30">
									<feature.icon className={`h-5 w-5 ${feature.color}`} />
								</div>
								<h3 className="font-medium leading-tight">{feature.title}</h3>
							</div>
							<p className="mt-3 text-muted-foreground text-sm leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>

				{/* Bottom note */}
				<div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border/60 bg-card/35 p-6 text-center backdrop-blur">
					<p className="text-muted-foreground text-sm leading-relaxed">
						No fluff metrics. Every view is designed to answer one question:
						<span className="text-foreground">
							{" "}
							“What should I do more (or less) of next week?”
						</span>
					</p>
				</div>
			</div>
		</section>
	);
}
