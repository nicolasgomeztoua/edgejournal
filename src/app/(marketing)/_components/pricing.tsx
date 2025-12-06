"use client";

import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Key, Sparkles, Zap } from "lucide-react";

const plans = [
	{
		name: "Free",
		description: "Perfect for getting started",
		price: "$0",
		period: "forever",
		features: [
			"Up to 100 trades",
			"Basic analytics",
			"Manual trade entry",
			"CSV import",
			"7-day data retention",
		],
		cta: "Get Started",
		popular: false,
	},
	{
		name: "Pro",
		description: "For serious traders",
		price: "$19",
		period: "/month",
		features: [
			"Unlimited trades",
			"Advanced analytics",
			"AI insights (BYOK)",
			"Priority support",
			"Unlimited data retention",
			"Export to CSV/PDF",
			"Custom tags & setups",
		],
		cta: "Start Free Trial",
		popular: true,
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
			"Admin controls",
			"SSO integration",
			"API access",
			"Dedicated support",
		],
		cta: "Contact Sales",
		popular: false,
	},
];

export function Pricing() {
	return (
		<section id="pricing" className="relative py-24">
			<div className="container mx-auto px-4">
				{/* Section header */}
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
						Simple, transparent pricing
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						Start free and scale as you grow. Bring your own AI keys or let us
						handle it.
					</p>
				</div>

				{/* BYOK explanation */}
				<div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-3 rounded-lg border border-border/50 bg-card/50 px-6 py-4">
					<Key className="h-5 w-5 text-primary" />
					<div className="text-sm">
						<span className="font-medium">Bring Your Own Key (BYOK):</span>{" "}
						<span className="text-muted-foreground">
							Use your OpenAI, Anthropic, or Google AI key. Your data, your
							costs, your control.
						</span>
					</div>
				</div>

				{/* Pricing cards */}
				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{plans.map((plan) => (
						<Card
							key={plan.name}
							className={`relative flex flex-col ${
								plan.popular
									? "border-primary/50 shadow-lg shadow-primary/10"
									: "border-border/50"
							}`}
						>
							{plan.popular && (
								<Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1">
									<Sparkles className="h-3 w-3" />
									Most Popular
								</Badge>
							)}

							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									{plan.name}
									{plan.name === "Pro" && (
										<Zap className="h-4 w-4 text-primary" />
									)}
								</CardTitle>
								<CardDescription>{plan.description}</CardDescription>
							</CardHeader>

							<CardContent className="flex-1">
								<div className="mb-6">
									<span className="text-4xl font-bold">{plan.price}</span>
									<span className="text-muted-foreground">{plan.period}</span>
								</div>

								<ul className="space-y-3">
									{plan.features.map((feature) => (
										<li key={feature} className="flex items-start gap-3">
											<Check className="mt-0.5 h-4 w-4 shrink-0 text-profit" />
											<span className="text-sm text-muted-foreground">
												{feature}
											</span>
										</li>
									))}
								</ul>
							</CardContent>

							<CardFooter>
								{plan.name === "Team" ? (
									<Button variant="outline" className="w-full">
										{plan.cta}
									</Button>
								) : (
									<SignUpButton mode="modal">
										<Button
											className="w-full"
											variant={plan.popular ? "default" : "outline"}
										>
											{plan.cta}
										</Button>
									</SignUpButton>
								)}
							</CardFooter>
						</Card>
					))}
				</div>

				{/* FAQ-style note */}
				<p className="mt-8 text-center text-sm text-muted-foreground">
					All plans include a 14-day free trial of Pro features. No credit card
					required.
				</p>
			</div>
		</section>
	);
}

