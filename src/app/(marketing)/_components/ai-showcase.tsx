"use client";

import { Brain, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const exampleQueries = [
	"Are my breakevens optimal?",
	"What's my best time to trade?",
	"How often do I cut winners early?",
	"Which setups have the best win rate?",
];

const exampleResponse = `Based on your last 200 trades, I've analyzed your breakeven patterns:

**Breakeven Analysis:**
- You move to breakeven on 34% of your winning trades
- 47% of these trades would have hit your original take profit
- Average missed profit per premature BE: $127

**Recommendation:**
Consider a scaled exit approach - move to BE after securing 1R profit, but keep a runner for the full target. Your win rate on trades you let run is 23% higher than your overall average.`;

export function AIShowcase() {
	const [selectedQuery, setSelectedQuery] = useState(exampleQueries[0]);
	const [showResponse, setShowResponse] = useState(false);

	return (
		<section className="relative py-24" id="ai">
			{/* Background effects */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
			<div className="-translate-y-1/2 absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-chart-3/10 blur-[100px]" />

			<div className="container relative mx-auto px-4">
				{/* Section header */}
				<div className="mx-auto max-w-2xl text-center">
					<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-chart-3/30 bg-chart-3/10 px-4 py-1.5 text-chart-3 text-sm">
						<Sparkles className="h-4 w-4" />
						AI-Powered
					</div>
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
						Ask anything about your trading
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						Natural language queries powered by your choice of AI. Get
						personalized insights that would take hours to analyze manually.
					</p>
				</div>

				{/* Interactive demo */}
				<div className="mx-auto mt-12 max-w-3xl">
					<Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
						{/* Chat header */}
						<div className="flex items-center gap-3 border-border/50 border-b px-6 py-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/20">
								<Brain className="h-5 w-5 text-chart-3" />
							</div>
							<div>
								<div className="font-medium">Trading AI Assistant</div>
								<div className="text-muted-foreground text-sm">
									Analyzing your performance data...
								</div>
							</div>
						</div>

						{/* Query selection */}
						<div className="border-border/50 border-b px-6 py-4">
							<div className="mb-3 text-muted-foreground text-sm">
								Try asking:
							</div>
							<div className="flex flex-wrap gap-2">
								{exampleQueries.map((query) => (
									<Button
										key={query}
										onClick={() => {
											setSelectedQuery(query);
											setShowResponse(false);
										}}
										size="sm"
										variant={selectedQuery === query ? "secondary" : "outline"}
									>
										{query}
									</Button>
								))}
							</div>
						</div>

						{/* Chat content */}
						<div className="min-h-[300px] p-6">
							{/* User message */}
							<div className="mb-6 flex justify-end">
								<div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2 text-primary-foreground">
									{selectedQuery}
								</div>
							</div>

							{/* AI response */}
							{showResponse ? (
								<div className="flex gap-3">
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-3/20">
										<Brain className="h-4 w-4 text-chart-3" />
									</div>
									<div className="rounded-2xl rounded-tl-md bg-secondary px-4 py-3">
										<div className="prose prose-sm prose-invert max-w-none">
											{exampleResponse.split("\n").map((line) => {
												if (line.startsWith("**") && line.endsWith("**")) {
													return (
														<p
															className="mt-3 font-semibold first:mt-0"
															key={`heading-${line}`}
														>
															{line.replace(/\*\*/g, "")}
														</p>
													);
												}
												if (line.startsWith("- ")) {
													return (
														<p
															className="ml-4 text-muted-foreground"
															key={`bullet-${line}`}
														>
															{line}
														</p>
													);
												}
												return line ? (
													<p
														className="text-muted-foreground"
														key={`text-${line}`}
													>
														{line}
													</p>
												) : null;
											})}
										</div>
									</div>
								</div>
							) : (
								<div className="flex items-center justify-center py-12">
									<Button
										className="gap-2"
										onClick={() => setShowResponse(true)}
									>
										<Send className="h-4 w-4" />
										See AI Response
									</Button>
								</div>
							)}
						</div>
					</Card>

					{/* Provider badges */}
					<div className="mt-6 flex items-center justify-center gap-4 text-muted-foreground text-sm">
						<span>Works with:</span>
						<div className="flex items-center gap-3">
							<span className="rounded border border-border/50 px-2 py-1">
								OpenAI
							</span>
							<span className="rounded border border-border/50 px-2 py-1">
								Anthropic
							</span>
							<span className="rounded border border-border/50 px-2 py-1">
								Google AI
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
