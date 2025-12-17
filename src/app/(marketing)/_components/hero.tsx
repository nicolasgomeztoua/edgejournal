"use client";

import { SignUpButton } from "@clerk/nextjs";
import {
	ArrowRight,
	BarChart3,
	Brain,
	LineChart,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Hero() {
	return (
		<section className="relative overflow-hidden">
			{/* Background */}
			<div className="gradient-trading absolute inset-0" />
			<div className="landing-mask-fade-y pointer-events-none absolute inset-0 bg-grid-fine opacity-[0.06]" />
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background" />

			{/* Glow */}
			<div className="-translate-x-1/2 pointer-events-none absolute top-[-12rem] left-1/2 h-[34rem] w-[34rem] rounded-full bg-primary/18 blur-[120px]" />
			<div className="pointer-events-none absolute right-[-10rem] bottom-[-10rem] h-[28rem] w-[28rem] rounded-full bg-chart-3/14 blur-[120px]" />

			<div className="container relative mx-auto px-4 py-16 sm:py-20 lg:py-24">
				<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
					{/* Copy */}
					<div className="text-left">
						<div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-sm backdrop-blur">
							<Sparkles className="h-4 w-4 text-primary" />
							<span className="text-muted-foreground">
								From raw fills → clean edge in minutes
							</span>
						</div>

						<h1 className="mt-6 font-semibold text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
							Your trading journal,{" "}
							<span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
								upgraded with AI
							</span>
							.
						</h1>

						<p className="mt-5 max-w-xl text-base text-muted-foreground leading-relaxed sm:text-lg">
							EdgeJournal turns every trade into a feedback loop: capture
							context, see patterns, and ask “why” in plain English. Built for
							futures and forex traders who obsess over process—not vibes.
						</p>

						<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
							<SignUpButton mode="modal">
								<Button className="gap-2 shadow-primary/20 shadow-sm" size="lg">
									Start free
									<ArrowRight className="h-4 w-4" />
								</Button>
							</SignUpButton>
							<Button asChild size="lg" variant="outline">
								<a href="#features">See what you’ll measure</a>
							</Button>
						</div>

						<div className="mt-8 flex flex-col gap-3 text-muted-foreground text-sm sm:flex-row sm:items-center sm:gap-6">
							<div className="inline-flex items-center gap-2">
								<ShieldCheck className="h-4 w-4 text-profit" />
								BYOK AI, your data stays yours
							</div>
							<div className="inline-flex items-center gap-2">
								<LineChart className="h-4 w-4 text-chart-2" />
								Analytics that reward discipline
							</div>
						</div>

						{/* Proof strip */}
						<div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
							<div className="rounded-xl border border-border/60 bg-card/30 p-4">
								<div className="font-semibold text-2xl text-profit">+32%</div>
								<div className="mt-1 text-muted-foreground text-xs">
									Win-rate improvement (sample)
								</div>
							</div>
							<div className="rounded-xl border border-border/60 bg-card/30 p-4">
								<div className="font-semibold text-2xl">10k+</div>
								<div className="mt-1 text-muted-foreground text-xs">
									Trades analyzed (demo data)
								</div>
							</div>
							<div className="hidden rounded-xl border border-border/60 bg-card/30 p-4 sm:block">
								<div className="font-semibold text-2xl text-chart-3">AI</div>
								<div className="mt-1 text-muted-foreground text-xs">
									Natural-language insights
								</div>
							</div>
						</div>
					</div>

					{/* Product preview */}
					<div className="relative">
						<div className="-inset-6 pointer-events-none absolute rounded-3xl bg-gradient-to-tr from-primary/12 via-transparent to-chart-3/10 blur-2xl" />

						<Card className="relative overflow-hidden border-border/60 bg-card/50 backdrop-blur">
							<div className="flex items-center justify-between border-border/60 border-b px-5 py-4">
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
										<BarChart3 className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="font-medium leading-none">
											Session recap
										</div>
										<div className="mt-1 text-muted-foreground text-xs">
											ES • London + NY overlap
										</div>
									</div>
								</div>

								<div className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs">
									<span className="text-muted-foreground">PnL</span>{" "}
									<span className="font-medium text-profit">+$412.50</span>
								</div>
							</div>

							<div className="grid gap-4 p-5 sm:grid-cols-2">
								<div className="rounded-xl border border-border/60 bg-background/30 p-4">
									<div className="flex items-center justify-between">
										<div className="text-muted-foreground text-xs">
											Best setup
										</div>
										<div className="text-muted-foreground text-xs">
											last 30d
										</div>
									</div>
									<div className="mt-3 font-semibold text-lg">
										Breakout → pullback
									</div>
									<div className="mt-3 grid grid-cols-3 gap-3 text-xs">
										<div>
											<div className="text-muted-foreground">Win rate</div>
											<div className="mt-1 font-medium text-profit">63%</div>
										</div>
										<div>
											<div className="text-muted-foreground">Avg R</div>
											<div className="mt-1 font-medium">1.42R</div>
										</div>
										<div>
											<div className="text-muted-foreground">Sample</div>
											<div className="mt-1 font-medium">48</div>
										</div>
									</div>
								</div>

								<div className="rounded-xl border border-border/60 bg-background/30 p-4">
									<div className="flex items-center justify-between">
										<div className="text-muted-foreground text-xs">AI note</div>
										<Brain className="h-4 w-4 text-chart-3" />
									</div>
									<p className="mt-3 text-muted-foreground text-sm leading-relaxed">
										You tighten stops after 2 losses. Consider a rule: “size
										down, don’t choke.” Your best sessions occur when first stop
										is unchanged.
									</p>
									<div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-muted-foreground text-xs">
										<span className="h-1.5 w-1.5 rounded-full bg-chart-3" />
										Powered by your key (BYOK)
									</div>
								</div>
							</div>

							<div className="border-border/60 border-t px-5 py-4">
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">Equity curve</span>
									<span className="text-muted-foreground">
										Last 14 sessions
									</span>
								</div>
								<div className="mt-3 h-16 w-full rounded-lg bg-grid-dot opacity-60" />
							</div>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
}
