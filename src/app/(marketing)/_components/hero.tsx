"use client";

import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Brain, LineChart } from "lucide-react";

export function Hero() {
	return (
		<section className="relative min-h-screen overflow-hidden pt-16">
			{/* Background gradient */}
			<div className="gradient-trading absolute inset-0" />
			
			{/* Animated grid background */}
			<div 
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
						linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
					backgroundSize: '60px 60px',
				}}
			/>
			
			{/* Glow effects */}
			<div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[128px]" />
			<div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-chart-2/20 blur-[128px]" />
			
			<div className="container relative mx-auto flex min-h-screen flex-col items-center justify-center px-4 text-center">
				{/* Badge */}
				<div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 text-sm backdrop-blur-sm">
					<span className="flex h-2 w-2 rounded-full bg-profit" />
					<span className="text-muted-foreground">
						AI-Powered Trading Analytics
					</span>
				</div>

				{/* Main headline */}
				<h1 className="max-w-4xl font-bold text-5xl leading-tight tracking-tight sm:text-6xl md:text-7xl">
					Trade Smarter with{" "}
					<span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
						AI-Powered
					</span>{" "}
					Insights
				</h1>

				{/* Subheadline */}
				<p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
					The professional trading journal for Futures and Forex traders. 
					Track your trades, analyze patterns, and get AI-driven insights 
					to improve your edge.
				</p>

				{/* CTA buttons */}
				<div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
					<SignUpButton mode="modal">
						<Button size="lg" className="gap-2 text-base">
							Start Free Trial
							<ArrowRight className="h-4 w-4" />
						</Button>
					</SignUpButton>
					<Button variant="outline" size="lg" className="text-base" asChild>
						<a href="#features">See How It Works</a>
					</Button>
				</div>

				{/* Stats */}
				<div className="mt-20 grid grid-cols-3 gap-8 sm:gap-16">
					<div className="text-center">
						<div className="font-bold text-3xl text-profit sm:text-4xl">
							+32%
						</div>
						<div className="mt-1 text-muted-foreground text-sm">
							Avg. Win Rate Improvement
						</div>
					</div>
					<div className="text-center">
						<div className="font-bold text-3xl sm:text-4xl">10K+</div>
						<div className="mt-1 text-muted-foreground text-sm">
							Trades Analyzed
						</div>
					</div>
					<div className="text-center">
						<div className="font-bold text-3xl text-chart-2 sm:text-4xl">
							AI
						</div>
						<div className="mt-1 text-muted-foreground text-sm">
							Powered Insights
						</div>
					</div>
				</div>

				{/* Feature preview cards */}
				<div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="group rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card">
						<LineChart className="h-8 w-8 text-primary" />
						<h3 className="mt-4 font-semibold">Trade Journal</h3>
						<p className="mt-2 text-muted-foreground text-sm">
							Log every trade with detailed entry/exit data and notes
						</p>
					</div>
					<div className="group rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-chart-2/50 hover:bg-card">
						<BarChart3 className="h-8 w-8 text-chart-2" />
						<h3 className="mt-4 font-semibold">Analytics</h3>
						<p className="mt-2 text-muted-foreground text-sm">
							Visualize performance with detailed charts and metrics
						</p>
					</div>
					<div className="group rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-chart-3/50 hover:bg-card">
						<Brain className="h-8 w-8 text-chart-3" />
						<h3 className="mt-4 font-semibold">AI Insights</h3>
						<p className="mt-2 text-muted-foreground text-sm">
							Ask questions about your trading in natural language
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}

