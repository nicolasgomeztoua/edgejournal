"use client";

import { SignUpButton } from "@clerk/nextjs";
import { Check, Key, Sparkles, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const plans = [
	{
		name: "Free",
		description: "Perfect for getting started",
		monthly: 0,
		yearly: 0,
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
		monthly: 19,
		yearly: 190,
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
		monthly: 49,
		yearly: 490,
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
	const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

	const displayPlans = useMemo(() => {
		return plans.map((plan) => {
			if (plan.period === "forever") {
				return { ...plan, priceLabel: "$0", periodLabel: "forever" };
			}

			if (billing === "yearly") {
				const suffix = plan.name === "Team" ? "/user/yr" : "/year";
				return { ...plan, priceLabel: `$${plan.yearly}`, periodLabel: suffix };
			}

			return {
				...plan,
				priceLabel: `$${plan.monthly}`,
				periodLabel: plan.period,
			};
		});
	}, [billing]);

	return (
		<section className="relative py-20 sm:py-24" id="pricing">
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
			<div className="container mx-auto px-4">
				{/* Section header */}
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
						Pricing that scales with discipline
					</h2>
					<p className="mt-4 text-base text-muted-foreground leading-relaxed sm:text-lg">
						Start free, upgrade when the journal becomes a habit. Bring your own
						AI keys (BYOK) or go Team for managed AI.
					</p>

					<div className="mt-8 flex justify-center">
						<Tabs
							defaultValue="monthly"
							onValueChange={(value) =>
								setBilling(value as "monthly" | "yearly")
							}
							value={billing}
						>
							<TabsList className="bg-card/40 backdrop-blur">
								<TabsTrigger value="monthly">Monthly</TabsTrigger>
								<TabsTrigger value="yearly">
									Yearly <span className="text-primary">(-2 mo)</span>
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				</div>

				{/* BYOK explanation */}
				<div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card/35 px-6 py-4 backdrop-blur">
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
					{displayPlans.map((plan) => (
						<Card
							className={cn(
								"relative flex flex-col overflow-hidden border-border/60 bg-card/35 backdrop-blur",
								plan.popular && "border-primary/50 shadow-lg shadow-primary/15",
							)}
							key={plan.name}
						>
							{plan.popular && (
								<div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_55%)]" />
							)}

							{plan.popular && (
								<Badge className="-top-3 -translate-x-1/2 absolute left-1/2 gap-1">
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
									<span className="font-semibold text-4xl">
										{plan.priceLabel}
									</span>
									<span className="text-muted-foreground">
										{plan.periodLabel}
									</span>
								</div>

								<ul className="space-y-3">
									{plan.features.map((feature) => (
										<li className="flex items-start gap-3" key={feature}>
											<Check className="mt-0.5 h-4 w-4 shrink-0 text-profit" />
											<span className="text-muted-foreground text-sm">
												{feature}
											</span>
										</li>
									))}
								</ul>
							</CardContent>

							<CardFooter>
								{plan.name === "Team" ? (
									<Button className="w-full" variant="outline">
										{plan.cta}
									</Button>
								) : (
									<SignUpButton mode="modal">
										<Button
											className="w-full shadow-primary/15 shadow-sm"
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
				<p className="mt-8 text-center text-muted-foreground text-sm">
					All plans include a 14-day free trial of Pro features. No credit card
					required.
				</p>
			</div>
		</section>
	);
}
