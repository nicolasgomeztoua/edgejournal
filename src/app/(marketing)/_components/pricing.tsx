"use client";

import { SignUpButton } from "@clerk/nextjs";
import { Check, Key, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
	{
		name: "Free",
		description: "Perfect for getting started",
		price: "$0",
		period: "forever",
		features: [
			"Up to 100 trades",
			"Basic analytics dashboard",
			"Manual trade entry",
			"CSV import",
			"7-day data history",
		],
		cta: "Get Started",
		popular: false,
		gradient: "from-muted-foreground/20 to-muted-foreground/5",
	},
	{
		name: "Pro",
		description: "For serious traders",
		price: "$19",
		period: "/month",
		features: [
			"Unlimited trades",
			"Advanced analytics & charts",
			"AI insights (BYOK)",
			"Unlimited data retention",
			"Export to CSV/PDF",
			"Custom tags & setups",
			"Priority support",
		],
		cta: "Start Free Trial",
		popular: true,
		gradient: "from-primary/20 to-accent/10",
	},
	{
		name: "Team",
		description: "For prop firms & groups",
		price: "$49",
		period: "/user/mo",
		features: [
			"Everything in Pro",
			"Team analytics dashboard",
			"Managed AI (no keys needed)",
			"Admin controls & roles",
			"SSO integration",
			"API access",
			"Dedicated support",
		],
		cta: "Contact Sales",
		popular: false,
		gradient: "from-accent/20 to-chart-3/10",
	},
];

export function Pricing() {
	return (
		<section className="relative overflow-hidden py-24 sm:py-32" id="pricing">
			{/* Background */}
			<div className="mesh-gradient absolute inset-0 opacity-30" />

			<div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section header */}
				<div className="mx-auto max-w-2xl text-center">
					<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm">
						<span className="text-primary">Pricing</span>
					</div>
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl lg:text-5xl">
						Simple, transparent
						<span className="mt-1 block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							pricing
						</span>
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						Start free and scale as you grow. No hidden fees, no surprises.
					</p>
				</div>

				{/* BYOK explanation */}
				<div className="mx-auto mt-8 flex max-w-xl items-center gap-4 rounded-2xl border border-primary/10 bg-primary/5 px-6 py-4">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
						<Key className="h-5 w-5 text-primary" />
					</div>
					<div className="text-sm">
						<span className="font-medium text-foreground">
							Bring Your Own Key
						</span>
						<span className="text-muted-foreground">
							{" "}
							— Use your OpenAI, Anthropic, or Google AI key. Your data, your
							costs, full control.
						</span>
					</div>
				</div>

				{/* Pricing cards */}
				<div className="mt-12 grid gap-6 lg:grid-cols-3">
					{plans.map((plan) => (
						<div
							className={`group relative flex flex-col rounded-2xl border transition-all ${
								plan.popular
									? "border-primary/30 bg-card/80 shadow-lg shadow-primary/10"
									: "border-white/[0.05] bg-card/50 hover:border-white/10"
							}`}
							key={plan.name}
						>
							{/* Popular badge */}
							{plan.popular && (
								<div className="absolute -top-3 left-1/2 -translate-x-1/2">
									<div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground text-xs shadow-lg shadow-primary/25">
										<Sparkles className="h-3 w-3" />
										Most Popular
									</div>
								</div>
							)}

							{/* Gradient background */}
							<div
								className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${plan.gradient} opacity-50`}
							/>

							<div className="relative flex flex-1 flex-col p-6">
								{/* Header */}
								<div className="flex items-center gap-2">
									<h3 className="font-semibold text-xl">{plan.name}</h3>
									{plan.name === "Pro" && (
										<Zap className="h-4 w-4 text-primary" />
									)}
								</div>
								<p className="mt-1 text-muted-foreground text-sm">
									{plan.description}
								</p>

								{/* Price */}
								<div className="mt-6 flex items-baseline">
									<span className="font-bold text-4xl tracking-tight">
										{plan.price}
									</span>
									<span className="ml-1 text-muted-foreground">
										{plan.period}
									</span>
								</div>

								{/* Features */}
								<ul className="mt-6 flex-1 space-y-3">
									{plan.features.map((feature) => (
										<li className="flex items-start gap-3" key={feature}>
											<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-profit/10">
												<Check className="h-3 w-3 text-profit" />
											</div>
											<span className="text-muted-foreground text-sm">
												{feature}
											</span>
										</li>
									))}
								</ul>

								{/* CTA */}
								<div className="mt-8">
									{plan.name === "Team" ? (
										<Button className="h-11 w-full" variant="outline">
											{plan.cta}
										</Button>
									) : (
										<SignUpButton mode="modal">
											<Button
												className={`h-11 w-full ${
													plan.popular ? "shadow-lg shadow-primary/25" : ""
												}`}
												variant={plan.popular ? "default" : "outline"}
											>
												{plan.cta}
											</Button>
										</SignUpButton>
									)}
								</div>
							</div>
						</div>
					))}
				</div>

				{/* FAQ note */}
				<p className="mt-12 text-center text-muted-foreground text-sm">
					All plans include a 14-day free trial of Pro features. No credit card
					required.
				</p>
			</div>
		</section>
	);
}
