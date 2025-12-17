"use client";

import { Quote, Star } from "lucide-react";

const testimonials = [
	{
		quote:
			"Finally, a journal built by traders who understand what we actually need. The AI insights have completely changed how I analyze my mistakes.",
		author: "Marcus Chen",
		role: "Futures Day Trader",
		metric: "+42% win rate",
		avatar: "MC",
	},
	{
		quote:
			"I've tried every trading journal out there. EdgeJournal is the only one I've stuck with. The import feature saved me hours of manual entry.",
		author: "Sarah Williams",
		role: "Forex Trader, 8 years",
		metric: "5,000+ trades logged",
		avatar: "SW",
	},
	{
		quote:
			"The fact that I can use my own API keys and know my data isn't being used to train AI models was the deciding factor for me.",
		author: "David Kim",
		role: "Prop Firm Trader",
		metric: "Funded in 3 months",
		avatar: "DK",
	},
	{
		quote:
			"Being able to ask 'Why am I losing on Fridays?' and get an actual analytical answer is mind-blowing. Worth every penny.",
		author: "Emma Rodriguez",
		role: "ES/NQ Scalper",
		metric: "2.8 profit factor",
		avatar: "ER",
	},
	{
		quote:
			"My prop firm requires detailed journaling. EdgeJournal makes it painless and the analytics help me stay in the green.",
		author: "James Thompson",
		role: "FTMO Trader",
		metric: "Passed 3 challenges",
		avatar: "JT",
	},
	{
		quote:
			"The breakeven analysis alone paid for my subscription 10x over. I was leaving so much money on the table without realizing it.",
		author: "Lisa Park",
		role: "Swing Trader",
		metric: "+$8,400 recovered",
		avatar: "LP",
	},
];

export function Testimonials() {
	return (
		<section className="relative overflow-hidden py-24 sm:py-32">
			{/* Background */}
			<div className="mesh-gradient absolute inset-0 opacity-30" />

			<div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section header */}
				<div className="mx-auto max-w-2xl text-center">
					<div className="mb-4 inline-flex items-center gap-1">
						{[...Array(5)].map((_, i) => (
							<Star
								className="h-5 w-5 fill-chart-4 text-chart-4"
								key={`star-${i}`}
							/>
						))}
					</div>
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl lg:text-5xl">
						Loved by traders
						<span className="mt-1 block text-muted-foreground">
							who are serious about performance
						</span>
					</h2>
				</div>

				{/* Testimonials grid */}
				<div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{testimonials.map((testimonial, index) => (
						<div
							className="group relative rounded-2xl border border-white/[0.05] bg-card/50 p-6 transition-all hover:border-white/10 hover:bg-card/80"
							key={testimonial.author}
							style={{
								animationDelay: `${index * 100}ms`,
							}}
						>
							{/* Quote icon */}
							<Quote className="h-8 w-8 text-primary/20" />

							{/* Quote text */}
							<blockquote className="mt-4 text-muted-foreground leading-relaxed">
								"{testimonial.quote}"
							</blockquote>

							{/* Author */}
							<div className="mt-6 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 font-medium text-sm">
									{testimonial.avatar}
								</div>
								<div className="flex-1">
									<div className="font-medium text-sm">
										{testimonial.author}
									</div>
									<div className="text-muted-foreground text-xs">
										{testimonial.role}
									</div>
								</div>
								<div className="rounded-lg bg-profit/10 px-2 py-1 font-medium text-profit text-xs">
									{testimonial.metric}
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Stats bar */}
				<div className="mt-20 rounded-2xl border border-white/[0.05] bg-card/50 p-8">
					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
						{[
							{ value: "2,400+", label: "Active Traders" },
							{ value: "180K+", label: "Trades Analyzed" },
							{ value: "4.9/5", label: "Average Rating" },
							{ value: "$2.1M+", label: "Insights Recovered" },
						].map((stat) => (
							<div className="text-center" key={stat.label}>
								<div className="font-bold text-3xl tracking-tight lg:text-4xl">
									{stat.value}
								</div>
								<div className="mt-1 text-muted-foreground text-sm">
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
