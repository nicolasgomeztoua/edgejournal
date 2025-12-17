"use client";

import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
	return (
		<section className="relative overflow-hidden py-24 sm:py-32">
			{/* Background */}
			<div className="mesh-gradient absolute inset-0" />

			{/* Gradient orbs */}
			<div
				className="absolute top-1/2 left-1/4 h-[500px] w-[500px] -translate-y-1/2 rounded-full opacity-30 blur-[120px]"
				style={{
					background:
						"radial-gradient(circle, oklch(0.75 0.18 165), transparent)",
				}}
			/>
			<div
				className="absolute top-1/2 right-1/4 h-[400px] w-[400px] -translate-y-1/2 rounded-full opacity-20 blur-[100px]"
				style={{
					background:
						"radial-gradient(circle, oklch(0.7 0.18 250), transparent)",
				}}
			/>

			<div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-3xl text-center">
					{/* Main headline */}
					<h2 className="font-bold text-3xl tracking-tight sm:text-4xl lg:text-5xl">
						Ready to find your edge?
					</h2>
					<p className="mt-4 text-lg text-muted-foreground sm:text-xl">
						Join thousands of traders who have transformed their performance
						with data-driven insights. Start your free trial today.
					</p>

					{/* CTA buttons */}
					<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
						<SignUpButton mode="modal">
							<Button
								className="group h-12 gap-2 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-primary/30 hover:shadow-xl"
								size="lg"
							>
								Start Free Trial
								<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
							</Button>
						</SignUpButton>
						<Button
							asChild
							className="h-12 px-8 text-base"
							size="lg"
							variant="outline"
						>
							<a href="#pricing">View Pricing</a>
						</Button>
					</div>

					{/* Trust badges */}
					<div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm">
						<div className="flex items-center gap-2">
							<CheckCircle className="h-5 w-5 text-profit" />
							<span>14-day free trial</span>
						</div>
						<div className="flex items-center gap-2">
							<CheckCircle className="h-5 w-5 text-profit" />
							<span>No credit card required</span>
						</div>
						<div className="flex items-center gap-2">
							<CheckCircle className="h-5 w-5 text-profit" />
							<span>Cancel anytime</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
