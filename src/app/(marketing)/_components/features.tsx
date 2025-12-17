"use client";

import {
	BarChart3,
	Brain,
	FileSpreadsheet,
	LineChart,
	Shield,
	Target,
	TrendingUp,
	Zap,
} from "lucide-react";

const _features = [
	{
		icon: LineChart,
		title: "Trade Journal",
		description:
			"Log every trade with entry/exit, sizing, stops, and notes. Build a complete record of your trading journey.",
		gradient: "from-primary to-primary/50",
		size: "large",
	},
	{
		icon: BarChart3,
		title: "Advanced Analytics",
		description:
			"Equity curves, P&L breakdowns, time-of-day analysis, and risk metrics.",
		gradient: "from-accent to-accent/50",
		size: "small",
	},
	{
		icon: Brain,
		title: "AI Insights",
		description:
			"Natural language queries about your performance. Ask anything.",
		gradient: "from-chart-3 to-chart-3/50",
		size: "small",
	},
	{
		icon: FileSpreadsheet,
		title: "CSV Import",
		description:
			"Import historical trades from any broker. Map columns, batch import thousands of trades in seconds.",
		gradient: "from-chart-4 to-chart-4/50",
		size: "medium",
	},
	{
		icon: Target,
		title: "Risk Management",
		description:
			"Track planned vs actual stops. Analyze target hit rates and optimize your R:R.",
		gradient: "from-profit to-profit/50",
		size: "medium",
	},
	{
		icon: TrendingUp,
		title: "Futures & Forex",
		description:
			"Built for ES, NQ, CL futures and major forex pairs with proper contract specs.",
		gradient: "from-primary to-accent",
		size: "small",
	},
	{
		icon: Zap,
		title: "Fast Entry",
		description:
			"Log trades in seconds with smart defaults and keyboard shortcuts.",
		gradient: "from-chart-4 to-primary",
		size: "small",
	},
	{
		icon: Shield,
		title: "Your Data, Your Keys",
		description:
			"Bring your own AI keys. Your trading data stays private and never trains AI models.",
		gradient: "from-muted-foreground to-muted-foreground/50",
		size: "large",
	},
];

export function Features() {
	return (
		<section className="relative py-24 sm:py-32" id="features">
			{/* Background */}
			<div className="mesh-gradient absolute inset-0 opacity-50" />

			<div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section header */}
				<div className="mx-auto max-w-2xl text-center">
					<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm">
						<span className="text-primary">Features</span>
					</div>
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl lg:text-5xl">
						Everything you need to
						<span className="mt-1 block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							find your trading edge
						</span>
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						A complete toolkit designed for serious traders who want to
						consistently improve their performance.
					</p>
				</div>

				{/* Bento grid */}
				<div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{/* Trade Journal - Large card */}
					<div className="group relative col-span-1 row-span-2 overflow-hidden rounded-2xl border border-white/[0.05] bg-card/50 p-6 transition-all hover:border-primary/30 hover:bg-card/80 sm:col-span-2 lg:col-span-2">
						<div
							className="absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-30"
							style={{
								background:
									"radial-gradient(circle, oklch(0.75 0.18 165), transparent)",
							}}
						/>
						<div className="relative">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
								<LineChart className="h-6 w-6 text-primary" />
							</div>
							<h3 className="mt-6 font-semibold text-xl">
								Comprehensive Trade Journal
							</h3>
							<p className="mt-3 text-muted-foreground leading-relaxed">
								Log every aspect of your trades including entry/exit prices,
								position sizing, stop losses, take profits, and detailed notes
								on your thought process. Build a complete record of your trading
								journey.
							</p>

							{/* Mini preview */}
							<div className="mt-6 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
								<div className="border-white/5 border-b px-4 py-2 text-muted-foreground text-xs">
									Recent Trades
								</div>
								<div className="divide-y divide-white/5">
									{[
										{ pair: "ES", side: "Long", pnl: "+$425", win: true },
										{ pair: "NQ", side: "Short", pnl: "+$890", win: true },
										{ pair: "EUR/USD", side: "Long", pnl: "-$120", win: false },
									].map((trade) => (
										<div
											className="flex items-center justify-between px-4 py-3"
											key={trade.pair}
										>
											<div className="flex items-center gap-3">
												<div
													className={`h-2 w-2 rounded-full ${trade.win ? "bg-profit" : "bg-loss"}`}
												/>
												<span className="font-mono text-sm">{trade.pair}</span>
												<span className="text-muted-foreground text-xs">
													{trade.side}
												</span>
											</div>
											<span
												className={`font-mono text-sm ${trade.win ? "text-profit" : "text-loss"}`}
											>
												{trade.pnl}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Analytics - Small card */}
					<div className="group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-card/50 p-6 transition-all hover:border-accent/30 hover:bg-card/80">
						<div
							className="absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30"
							style={{
								background:
									"radial-gradient(circle, oklch(0.7 0.18 250), transparent)",
							}}
						/>
						<div className="relative">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent/5">
								<BarChart3 className="h-5 w-5 text-accent" />
							</div>
							<h3 className="mt-4 font-semibold">Advanced Analytics</h3>
							<p className="mt-2 text-muted-foreground text-sm">
								Equity curves, P&L breakdowns, time-of-day analysis, and risk
								metrics like Sharpe ratio.
							</p>
						</div>
					</div>

					{/* AI Insights - Small card */}
					<div className="group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-card/50 p-6 transition-all hover:border-chart-3/30 hover:bg-card/80">
						<div
							className="absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30"
							style={{
								background:
									"radial-gradient(circle, oklch(0.7 0.2 300), transparent)",
							}}
						/>
						<div className="relative">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-chart-3/20 to-chart-3/5">
								<Brain className="h-5 w-5 text-chart-3" />
							</div>
							<h3 className="mt-4 font-semibold">AI Insights</h3>
							<p className="mt-2 text-muted-foreground text-sm">
								Natural language queries. Ask anything about your trading
								performance.
							</p>
						</div>
					</div>

					{/* CSV Import - Medium card */}
					<div className="group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-card/50 p-6 transition-all hover:border-chart-4/30 hover:bg-card/80 sm:col-span-2 lg:col-span-1">
						<div className="relative">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-chart-4/20 to-chart-4/5">
								<FileSpreadsheet className="h-5 w-5 text-chart-4" />
							</div>
							<h3 className="mt-4 font-semibold">CSV Import</h3>
							<p className="mt-2 text-muted-foreground text-sm">
								Import historical trades from any broker. Map columns and batch
								import thousands of trades.
							</p>
							<div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
								<span className="rounded bg-white/5 px-2 py-1">MT4</span>
								<span className="rounded bg-white/5 px-2 py-1">MT5</span>
								<span className="rounded bg-white/5 px-2 py-1">
									TradingView
								</span>
							</div>
						</div>
					</div>

					{/* Risk Management - Medium card */}
					<div className="group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-card/50 p-6 transition-all hover:border-profit/30 hover:bg-card/80 sm:col-span-2 lg:col-span-1">
						<div className="relative">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-profit/20 to-profit/5">
								<Target className="h-5 w-5 text-profit" />
							</div>
							<h3 className="mt-4 font-semibold">Risk Management</h3>
							<p className="mt-2 text-muted-foreground text-sm">
								Track planned vs actual stop losses. Analyze target hit rates
								and optimize R:R.
							</p>
							<div className="mt-4 flex items-center gap-4">
								<div>
									<div className="font-semibold text-lg text-profit">1:2.5</div>
									<div className="text-muted-foreground text-xs">Avg RRR</div>
								</div>
								<div>
									<div className="font-semibold text-lg">72%</div>
									<div className="text-muted-foreground text-xs">
										Target Hit
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Futures & Forex + Fast Entry - Small cards in a row */}
					<div className="group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-card/50 p-6 transition-all hover:border-primary/30 hover:bg-card/80">
						<div className="relative">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/10">
								<TrendingUp className="h-5 w-5 text-primary" />
							</div>
							<h3 className="mt-4 font-semibold">Futures & Forex</h3>
							<p className="mt-2 text-muted-foreground text-sm">
								ES, NQ, CL and major pairs with proper specs.
							</p>
						</div>
					</div>

					<div className="group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-card/50 p-6 transition-all hover:border-chart-4/30 hover:bg-card/80">
						<div className="relative">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-chart-4/20 to-primary/10">
								<Zap className="h-5 w-5 text-chart-4" />
							</div>
							<h3 className="mt-4 font-semibold">Fast Entry</h3>
							<p className="mt-2 text-muted-foreground text-sm">
								Log trades in seconds with smart defaults.
							</p>
						</div>
					</div>

					{/* Privacy - Large card */}
					<div className="group relative col-span-1 overflow-hidden rounded-2xl border border-white/[0.05] bg-card/50 p-6 transition-all hover:border-white/20 hover:bg-card/80 sm:col-span-2">
						<div className="relative flex flex-col sm:flex-row sm:items-center sm:gap-6">
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5">
								<Shield className="h-6 w-6 text-foreground" />
							</div>
							<div className="mt-4 sm:mt-0">
								<h3 className="font-semibold text-xl">Your Data, Your Keys</h3>
								<p className="mt-2 text-muted-foreground leading-relaxed">
									Bring your own AI API keys (OpenAI, Anthropic, or Google).
									Your trading data stays private and is never used to train AI
									models. Full control, always.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
