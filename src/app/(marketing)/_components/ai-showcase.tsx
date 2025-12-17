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
		<section className="relative py-20 sm:py-24" id="ai">
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-primary/6 to-background" />
			<div className="pointer-events-none absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-chart-3/12 blur-[120px]" />
			<div className="pointer-events-none absolute right-[8%] bottom-[10%] h-72 w-72 rounded-full bg-primary/12 blur-[120px]" />

			<div className="container relative mx-auto px-4">
				<div className="grid items-start gap-10 lg:grid-cols-[1fr,1.15fr] lg:gap-14">
					{/* Copy */}
					<div className="max-w-xl">
						<div className="inline-flex items-center gap-2 rounded-full border border-chart-3/30 bg-chart-3/10 px-3 py-1.5 text-sm text-chart-3">
							<Sparkles className="h-4 w-4" />
							AI analyst for your journal
						</div>
						<h2 className="mt-6 font-semibold text-3xl tracking-tight sm:text-4xl">
							Ask “why” and get answers you can verify
						</h2>
						<p className="mt-4 text-base text-muted-foreground leading-relaxed sm:text-lg">
							Query your trades in plain English, then validate the insight with
							filters and charts. Use your own provider keys—your trading data is
							never used to train models.
						</p>

						<div className="mt-8 grid gap-3 sm:grid-cols-2">
							<div className="rounded-2xl border border-border/60 bg-card/35 p-4 backdrop-blur">
								<div className="text-muted-foreground text-xs">Examples</div>
								<div className="mt-2 font-medium">
									“Do I cut winners early?”
								</div>
								<p className="mt-2 text-muted-foreground text-sm">
									Find behavior patterns across setups and sessions.
								</p>
							</div>
							<div className="rounded-2xl border border-border/60 bg-card/35 p-4 backdrop-blur">
								<div className="text-muted-foreground text-xs">Guardrails</div>
								<div className="mt-2 font-medium">BYOK + privacy-first</div>
								<p className="mt-2 text-muted-foreground text-sm">
									You control the AI costs and the data flow.
								</p>
							</div>
						</div>
					</div>

					{/* Interactive demo */}
					<div className="relative">
						<div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-tr from-chart-3/14 via-transparent to-primary/10 blur-2xl" />
						<Card className="relative overflow-hidden border-border/60 bg-card/50 backdrop-blur">
							{/* Chat header */}
							<div className="flex items-center gap-3 border-border/60 border-b px-6 py-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/15">
									<Brain className="h-5 w-5 text-chart-3" />
								</div>
								<div>
									<div className="font-medium">Edge AI</div>
									<div className="text-muted-foreground text-sm">
										Analyzing your trading data…
									</div>
								</div>
							</div>

							{/* Query selection */}
							<div className="border-border/60 border-b px-6 py-4">
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
							<div className="min-h-[320px] p-6">
								<div className="mb-6 flex justify-end">
									<div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2 text-primary-foreground">
										{selectedQuery}
									</div>
								</div>

								{showResponse ? (
									<div className="flex gap-3">
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-3/15">
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
											className="gap-2 shadow-sm shadow-primary/15"
											onClick={() => setShowResponse(true)}
										>
											<Send className="h-4 w-4" />
											See AI response
										</Button>
									</div>
								)}
							</div>
						</Card>

						<div className="mt-4 flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
							<span>Works with:</span>
							<span className="rounded-md border border-border/60 bg-card/30 px-2 py-1">
								OpenAI
							</span>
							<span className="rounded-md border border-border/60 bg-card/30 px-2 py-1">
								Anthropic
							</span>
							<span className="rounded-md border border-border/60 bg-card/30 px-2 py-1">
								Google AI
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
