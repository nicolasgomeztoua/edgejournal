"use client";

import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function Hero() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!containerRef.current) return;
			const rect = containerRef.current.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width) * 100;
			const y = ((e.clientY - rect.top) / rect.height) * 100;
			setMousePosition({ x, y });
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	return (
		<section
			className="relative min-h-screen overflow-hidden"
			ref={containerRef}
		>
			{/* Animated mesh gradient background */}
			<div className="mesh-gradient absolute inset-0" />

			{/* Noise texture */}
			<div className="noise absolute inset-0" />

			{/* Animated gradient orbs */}
			<div
				className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full opacity-30 blur-[120px]"
				style={{
					background:
						"radial-gradient(circle, oklch(0.75 0.18 165) 0%, transparent 70%)",
					transform: `translate(${(mousePosition.x - 50) * 0.02}%, ${(mousePosition.y - 50) * 0.02}%)`,
					transition: "transform 0.3s ease-out",
				}}
			/>
			<div
				className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full opacity-20 blur-[100px]"
				style={{
					background:
						"radial-gradient(circle, oklch(0.7 0.18 250) 0%, transparent 70%)",
					transform: `translate(${(mousePosition.x - 50) * -0.015}%, ${(mousePosition.y - 50) * 0.015}%)`,
					transition: "transform 0.3s ease-out",
				}}
			/>
			<div
				className="absolute bottom-1/4 left-1/3 h-[400px] w-[400px] rounded-full opacity-15 blur-[80px]"
				style={{
					background:
						"radial-gradient(circle, oklch(0.7 0.2 300) 0%, transparent 70%)",
					transform: `translate(${(mousePosition.x - 50) * 0.01}%, ${(mousePosition.y - 50) * -0.01}%)`,
					transition: "transform 0.3s ease-out",
				}}
			/>

			{/* Grid pattern */}
			<div
				className="absolute inset-0 opacity-[0.015]"
				style={{
					backgroundImage: `
						linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
						linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
					`,
					backgroundSize: "80px 80px",
				}}
			/>

			{/* Main content */}
			<div className="container relative mx-auto flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-12 sm:px-6 lg:px-8">
				{/* Announcement badge */}
				<div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm backdrop-blur-sm">
					<Sparkles className="h-4 w-4 text-primary" />
					<span className="text-muted-foreground">
						Now with AI-powered trade analysis
					</span>
					<ArrowRight className="h-3 w-3 text-muted-foreground" />
				</div>

				{/* Main headline */}
				<h1 className="animation-delay-100 max-w-5xl animate-fade-in text-center font-bold text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
					<span className="block">Find your edge.</span>
					<span className="mt-2 block bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
						Master your trades.
					</span>
				</h1>

				{/* Subheadline */}
				<p className="animation-delay-200 mt-6 max-w-2xl animate-fade-in text-center text-lg text-muted-foreground sm:text-xl">
					The professional trading journal that helps you track, analyze, and
					improve. Built for futures and forex traders who are serious about
					performance.
				</p>

				{/* CTA buttons */}
				<div className="animation-delay-300 mt-10 flex animate-fade-in flex-col items-center gap-4 sm:flex-row">
					<SignUpButton mode="modal">
						<Button
							className="group h-12 gap-2 px-6 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-primary/30 hover:shadow-xl"
							size="lg"
						>
							Start Free Trial
							<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
						</Button>
					</SignUpButton>
					<Button
						asChild
						className="h-12 gap-2 px-6 text-base"
						size="lg"
						variant="outline"
					>
						<a href="#features">
							<Play className="h-4 w-4" />
							See How It Works
						</a>
					</Button>
				</div>

				{/* Stats row */}
				<div className="animation-delay-400 mt-20 grid animate-fade-in grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12">
					<div className="text-center">
						<div className="font-semibold text-3xl text-profit tabular-nums tracking-tight sm:text-4xl">
							+32%
						</div>
						<div className="mt-1 text-muted-foreground text-sm">
							Win Rate Boost
						</div>
					</div>
					<div className="text-center">
						<div className="font-semibold text-3xl tabular-nums tracking-tight sm:text-4xl">
							50K+
						</div>
						<div className="mt-1 text-muted-foreground text-sm">
							Trades Logged
						</div>
					</div>
					<div className="text-center">
						<div className="font-semibold text-3xl text-accent tabular-nums tracking-tight sm:text-4xl">
							2.5s
						</div>
						<div className="mt-1 text-muted-foreground text-sm">
							Avg. Log Time
						</div>
					</div>
					<div className="text-center">
						<div className="font-semibold text-3xl text-chart-3 tracking-tight sm:text-4xl">
							AI
						</div>
						<div className="mt-1 text-muted-foreground text-sm">
							Powered Insights
						</div>
					</div>
				</div>

				{/* Dashboard preview */}
				<div className="animation-delay-500 relative mt-20 w-full max-w-5xl animate-fade-in">
					{/* Glow behind dashboard */}
					<div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-chart-3/20 opacity-50 blur-3xl" />

					{/* Dashboard mockup */}
					<div className="relative overflow-hidden rounded-xl border border-white/10 bg-card/80 shadow-2xl backdrop-blur-sm">
						{/* Browser chrome */}
						<div className="flex items-center gap-2 border-white/5 border-b bg-black/20 px-4 py-3">
							<div className="flex gap-1.5">
								<div className="h-3 w-3 rounded-full bg-white/10" />
								<div className="h-3 w-3 rounded-full bg-white/10" />
								<div className="h-3 w-3 rounded-full bg-white/10" />
							</div>
							<div className="mx-auto flex h-7 w-72 items-center justify-center rounded-md bg-white/5 text-muted-foreground text-xs">
								app.edgejournal.com/dashboard
							</div>
						</div>

						{/* Dashboard content preview */}
						<div className="p-6">
							<div className="grid gap-4 sm:grid-cols-4">
								{/* Stat cards */}
								{[
									{
										label: "Total P&L",
										value: "+$12,450",
										color: "text-profit",
									},
									{
										label: "Win Rate",
										value: "67.3%",
										color: "text-foreground",
									},
									{
										label: "Profit Factor",
										value: "2.14",
										color: "text-accent",
									},
									{ label: "Avg. RRR", value: "1:2.5", color: "text-primary" },
								].map((stat) => (
									<div
										className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
										key={stat.label}
									>
										<div className="text-muted-foreground text-xs">
											{stat.label}
										</div>
										<div
											className={`mt-1 font-semibold text-xl tabular-nums ${stat.color}`}
										>
											{stat.value}
										</div>
									</div>
								))}
							</div>

							{/* Chart placeholder */}
							<div className="mt-4 h-48 rounded-lg border border-white/5 bg-white/[0.02] p-4">
								<div className="flex h-full items-end gap-1">
									{[
										40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50, 70, 85, 65,
										80, 90, 55, 75, 88,
									].map((height, i) => (
										<div
											className={`flex-1 rounded-sm transition-all ${
												height > 60
													? "bg-gradient-to-t from-profit/60 to-profit"
													: "bg-gradient-to-t from-loss/60 to-loss"
											}`}
											key={`bar-${i}`}
											style={{ height: `${height}%` }}
										/>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Floating elements */}
					<div className="animation-delay-700 absolute top-1/4 -right-4 hidden animate-fade-in rounded-lg border border-white/10 bg-card/90 p-3 shadow-xl backdrop-blur-sm lg:block">
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-md bg-profit/10">
								<svg
									aria-hidden="true"
									className="h-4 w-4 text-profit"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									viewBox="0 0 24 24"
								>
									<path d="M23 6l-9.5 9.5-5-5L1 18" />
								</svg>
							</div>
							<div>
								<div className="text-muted-foreground text-xs">Today's P&L</div>
								<div className="font-medium text-profit text-sm">+$847.50</div>
							</div>
						</div>
					</div>

					<div className="animation-delay-800 absolute bottom-1/3 -left-4 hidden animate-fade-in rounded-lg border border-white/10 bg-card/90 p-3 shadow-xl backdrop-blur-sm lg:block">
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
								<Sparkles className="h-4 w-4 text-primary" />
							</div>
							<div>
								<div className="text-muted-foreground text-xs">AI Insight</div>
								<div className="text-sm">Best time: 9-11 AM</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
