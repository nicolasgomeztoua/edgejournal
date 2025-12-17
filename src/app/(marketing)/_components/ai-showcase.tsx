"use client";

import { Brain, Send, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const conversations = [
	{
		query: "What's my best trading time?",
		response: `Based on your last 180 trades:

**Peak Performance Window**
• 9:30 - 11:00 AM EST shows 73% win rate
• Average profit per trade: $245 vs $89 overall
• You take 2.4x more trades in this window

**Recommendation:** Focus your A+ setups during market open. Your afternoon trades (2-4 PM) show only 41% win rate.`,
	},
	{
		query: "Am I cutting winners too early?",
		response: `Yes, there's significant room for improvement:

**Analysis of 94 Winning Trades**
• You exit 67% of winners before hitting your planned target
• Average missed profit: $127 per trade
• That's ~$7,900 left on the table this month

**Pattern Detected:** You tend to exit early when P&L hits +$200. Your original targets averaged +$340.

**Suggestion:** Try scaling out - take 50% at +$200, let the rest run to target.`,
	},
	{
		query: "Which setup performs best?",
		response: `Ranking your setups by profitability:

**Top 3 Setups**
1. **Opening Range Breakout** - 78% win rate, +$4,230 total
2. **VWAP Bounce** - 65% win rate, +$2,890 total
3. **Gap Fill** - 71% win rate, +$1,450 total

**Underperforming**
• Trend Continuation: 42% win rate, -$890
• Reversal trades: 38% win rate, -$1,200

**Insight:** Your edge is clearly in momentum plays, not reversals. Consider dropping reversal setups entirely.`,
	},
	{
		query: "How's my risk management?",
		response: `Overall: **Needs Improvement** ⚠️

**Stop Loss Discipline**
• You honor your original SL 61% of the time
• When you widen stops, you lose 82% of those trades
• Moving to breakeven too early costs you $3,400/mo

**Position Sizing**
• You're sizing correctly on 78% of trades
• But you're 2x overweight on "revenge trades"
• Largest single-trade loss: $890 (4.2% of account)

**Action Items:**
1. Never widen a stop loss
2. Take a 30-min break after any loss > $200`,
	},
];

export function AIShowcase() {
	const [activeConvo, setActiveConvo] = useState(0);
	const [isTyping, setIsTyping] = useState(false);
	const [displayedResponse, setDisplayedResponse] = useState("");
	const [showResponse, setShowResponse] = useState(false);

	useEffect(() => {
		if (showResponse) {
			const conversation = conversations[activeConvo];
			if (!conversation) return;

			setIsTyping(true);
			setDisplayedResponse("");
			const response = conversation.response;
			let i = 0;
			const interval = setInterval(() => {
				if (i < response.length) {
					setDisplayedResponse(response.slice(0, i + 1));
					i++;
				} else {
					clearInterval(interval);
					setIsTyping(false);
				}
			}, 8);
			return () => clearInterval(interval);
		}
	}, [showResponse, activeConvo]);

	const handleQueryClick = (index: number) => {
		if (index !== activeConvo) {
			setActiveConvo(index);
			setShowResponse(false);
			setDisplayedResponse("");
		}
	};

	return (
		<section className="relative overflow-hidden py-24 sm:py-32" id="ai">
			{/* Background effects */}
			<div className="mesh-gradient absolute inset-0 opacity-50" />
			<div
				className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
				style={{
					background:
						"radial-gradient(circle, oklch(0.7 0.2 300), transparent)",
				}}
			/>

			<div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section header */}
				<div className="mx-auto max-w-2xl text-center">
					<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-chart-3/20 bg-chart-3/5 px-3 py-1 text-sm">
						<Sparkles className="h-4 w-4 text-chart-3" />
						<span className="text-chart-3">AI-Powered</span>
					</div>
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl lg:text-5xl">
						Ask anything about
						<span className="mt-1 block bg-gradient-to-r from-chart-3 to-accent bg-clip-text text-transparent">
							your trading performance
						</span>
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						Natural language queries powered by your choice of AI provider. Get
						insights that would take hours to analyze manually.
					</p>
				</div>

				{/* Interactive demo */}
				<div className="mx-auto mt-12 max-w-4xl">
					<div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-card/80 shadow-2xl backdrop-blur-sm">
						{/* Chat header */}
						<div className="flex items-center gap-3 border-white/5 border-b bg-white/[0.02] px-6 py-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-3/5">
								<Brain className="h-5 w-5 text-chart-3" />
							</div>
							<div>
								<div className="font-medium">Trading AI Assistant</div>
								<div className="flex items-center gap-2 text-muted-foreground text-sm">
									<span className="flex h-2 w-2 rounded-full bg-profit" />
									Analyzing your performance data
								</div>
							</div>
						</div>

						{/* Query buttons */}
						<div className="border-white/5 border-b px-6 py-4">
							<div className="mb-2 text-muted-foreground text-xs uppercase tracking-wider">
								Try asking
							</div>
							<div className="flex flex-wrap gap-2">
								{conversations.map((convo, index) => (
									<button
										className={`rounded-lg px-3 py-2 text-sm transition-all ${
											activeConvo === index
												? "border border-primary/20 bg-primary/10 text-primary"
												: "border border-transparent bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
										}`}
										key={convo.query}
										onClick={() => handleQueryClick(index)}
										type="button"
									>
										{convo.query}
									</button>
								))}
							</div>
						</div>

						{/* Chat content */}
						<div className="min-h-[400px] space-y-4 p-6">
							{/* User message */}
							<div className="flex justify-end">
								<div className="flex max-w-[85%] items-end gap-2">
									<div className="rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground">
										{conversations[activeConvo]?.query}
									</div>
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
										<User className="h-4 w-4 text-primary" />
									</div>
								</div>
							</div>

							{/* AI response */}
							{showResponse ? (
								<div className="flex gap-3">
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chart-3/20">
										<Brain className="h-4 w-4 text-chart-3" />
									</div>
									<div className="max-w-[85%] flex-1">
										<div className="rounded-2xl rounded-tl-md border border-white/5 bg-white/5 px-4 py-3">
											<div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed">
												{displayedResponse.split("\n").map((line, i) => {
													if (line.startsWith("**") && line.endsWith("**")) {
														return (
															<p
																className="mt-3 font-semibold text-foreground first:mt-0"
																key={`h-${i}`}
															>
																{line.replace(/\*\*/g, "")}
															</p>
														);
													}
													if (line.includes("**")) {
														const parts = line.split(/\*\*/);
														return (
															<p
																className="text-muted-foreground"
																key={`b-${i}`}
															>
																{parts.map((part, j) =>
																	j % 2 === 1 ? (
																		<span
																			className="font-medium text-foreground"
																			key={`p-${j}`}
																		>
																			{part}
																		</span>
																	) : (
																		part
																	),
																)}
															</p>
														);
													}
													if (
														line.startsWith("•") ||
														line.startsWith("1.") ||
														line.startsWith("2.") ||
														line.startsWith("3.")
													) {
														return (
															<p
																className="ml-2 text-muted-foreground"
																key={`l-${i}`}
															>
																{line}
															</p>
														);
													}
													return line.trim() ? (
														<p className="text-muted-foreground" key={`t-${i}`}>
															{line}
														</p>
													) : (
														<div className="h-2" key={`s-${i}`} />
													);
												})}
												{isTyping && (
													<span className="ml-1 inline-block h-4 w-2 animate-pulse bg-chart-3" />
												)}
											</div>
										</div>
									</div>
								</div>
							) : (
								<div className="flex items-center justify-center py-16">
									<Button
										className="gap-2 border border-chart-3/20 bg-chart-3/10 text-chart-3 hover:bg-chart-3/20"
										onClick={() => setShowResponse(true)}
										size="lg"
									>
										<Send className="h-4 w-4" />
										See AI Response
									</Button>
								</div>
							)}
						</div>
					</div>

					{/* Provider badges */}
					<div className="mt-8 flex flex-col items-center justify-center gap-4 text-muted-foreground text-sm sm:flex-row">
						<span>Works with your API key:</span>
						<div className="flex items-center gap-2">
							{["OpenAI", "Anthropic", "Google AI"].map((provider) => (
								<span
									className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-foreground"
									key={provider}
								>
									{provider}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
