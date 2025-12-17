"use client";

import { Brain, Key, Loader2, Send, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { api } from "@/trpc/react";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

const EXAMPLE_QUERIES = [
	"Are my breakevens optimal?",
	"What's my best trading time of day?",
	"Which setups have the highest win rate?",
	"How often do I cut winners early?",
	"What's my average R:R on winning trades?",
	"Show me my performance by symbol",
];

export default function AIInsightsPage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	const { data: stats } = api.trades.getStats.useQuery();
	const { data: trades } = api.trades.getAll.useQuery({
		status: "closed",
		limit: 100,
	});

	// Scroll to bottom when new messages arrive
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, []);

	// Check if user has API key configured (placeholder - would check settings)
	useEffect(() => {
		// For now, assume no key is set
		setHasApiKey(false);
	}, []);

	const generateLocalInsight = (query: string): string => {
		if (!stats || !trades?.items) {
			return "I don't have enough trade data to analyze. Start logging some trades first!";
		}

		const lowerQuery = query.toLowerCase();
		const closedTrades = trades.items.filter((t) => t.netPnl);

		// Win rate analysis
		if (lowerQuery.includes("win rate") || lowerQuery.includes("winning")) {
			return (
				`Based on ${stats.totalTrades} closed trades:\n\n` +
				`**Win Rate:** ${formatPercent(stats.winRate, 1).replace("+", "")}\n` +
				`- Wins: ${stats.wins}\n` +
				`- Losses: ${stats.losses}\n` +
				`- Breakeven: ${stats.breakevens}\n\n` +
				`**Insight:** ${
					stats.winRate >= 50
						? "Your win rate is above 50%, which is a solid foundation. Focus on improving your risk-reward ratio to maximize profits."
						: "Your win rate is below 50%, but that's not necessarily bad if your winners are larger than your losers. Focus on letting winners run and cutting losers quickly."
				}`
			);
		}

		// Breakeven analysis
		if (lowerQuery.includes("breakeven") || lowerQuery.includes("break even")) {
			const beRate = (stats.breakevens / Math.max(stats.totalTrades, 1)) * 100;
			return (
				`**Breakeven Analysis:**\n\n` +
				`Out of ${stats.totalTrades} trades, ${
					stats.breakevens
				} ended at breakeven (${beRate.toFixed(1)}%).\n\n` +
				`**Insight:** ${
					beRate > 10
						? "You're moving to breakeven frequently. Consider if you're cutting winners too early. Analyze if those breakeven trades would have hit your original targets."
						: "Your breakeven rate is reasonable. You're letting your trades play out."
				}`
			);
		}

		// Setup analysis
		if (lowerQuery.includes("setup") || lowerQuery.includes("strategy")) {
			const setupStats: Record<
				string,
				{ wins: number; losses: number; pnl: number }
			> = {};
			closedTrades.forEach((t) => {
				const setup = t.setupType || "Unclassified";
				if (!setupStats[setup]) {
					setupStats[setup] = { wins: 0, losses: 0, pnl: 0 };
				}
				const pnl = parseFloat(t.netPnl ?? "0");
				setupStats[setup].pnl += pnl;
				if (pnl > 0) setupStats[setup].wins++;
				else if (pnl < 0) setupStats[setup].losses++;
			});

			const setupSummary = Object.entries(setupStats)
				.map(([setup, data]) => {
					const total = data.wins + data.losses;
					const wr = total > 0 ? ((data.wins / total) * 100).toFixed(1) : "0";
					return `- **${setup}:** ${wr}% win rate, ${formatCurrency(
						data.pnl,
					)} P&L`;
				})
				.join("\n");

			return (
				`**Setup Performance:**\n\n${setupSummary}\n\n` +
				`**Insight:** Focus on your highest win rate setups and consider reducing position size or eliminating underperforming setups.`
			);
		}

		// Symbol analysis
		if (lowerQuery.includes("symbol") || lowerQuery.includes("instrument")) {
			const symbolStats: Record<
				string,
				{ wins: number; losses: number; pnl: number }
			> = {};
			closedTrades.forEach((t) => {
				const symbol = t.symbol;
				if (!symbolStats[symbol]) {
					symbolStats[symbol] = { wins: 0, losses: 0, pnl: 0 };
				}
				const pnl = parseFloat(t.netPnl ?? "0");
				symbolStats[symbol].pnl += pnl;
				if (pnl > 0) symbolStats[symbol].wins++;
				else if (pnl < 0) symbolStats[symbol].losses++;
			});

			const symbolSummary = Object.entries(symbolStats)
				.sort((a, b) => b[1].pnl - a[1].pnl)
				.map(([symbol, data]) => {
					const total = data.wins + data.losses;
					const wr = total > 0 ? ((data.wins / total) * 100).toFixed(1) : "0";
					return `- **${symbol}:** ${wr}% win rate, ${formatCurrency(
						data.pnl,
					)} P&L`;
				})
				.join("\n");

			return (
				`**Performance by Symbol:**\n\n${symbolSummary}\n\n` +
				`**Insight:** Focus on your best performing symbols. Consider if you understand certain markets better than others.`
			);
		}

		// Profit factor analysis
		if (
			lowerQuery.includes("profit factor") ||
			lowerQuery.includes("r:r") ||
			lowerQuery.includes("risk")
		) {
			return (
				`**Risk Analysis:**\n\n` +
				`- Profit Factor: ${
					stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)
				}\n` +
				`- Average Win: ${formatCurrency(stats.avgWin)}\n` +
				`- Average Loss: ${formatCurrency(stats.avgLoss)}\n` +
				`- Avg R:R: ${
					stats.avgLoss > 0 ? (stats.avgWin / stats.avgLoss).toFixed(2) : "N/A"
				}\n\n` +
				`**Insight:** ${
					stats.profitFactor >= 1.5
						? "Your profit factor is healthy. You're managing risk well."
						: "Consider improving your risk-reward ratio by letting winners run longer or cutting losses quicker."
				}`
			);
		}

		// Default response
		return (
			`**Quick Stats:**\n\n` +
			`- Total P&L: ${formatCurrency(stats.totalPnl)}\n` +
			`- Win Rate: ${formatPercent(stats.winRate, 1).replace("+", "")}\n` +
			`- Profit Factor: ${
				stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)
			}\n` +
			`- Total Trades: ${stats.totalTrades}\n\n` +
			`Try asking about specific aspects like "What's my win rate?", "Which setups work best?", or "Show me performance by symbol".`
		);
	};

	const handleSend = async () => {
		if (!input.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content: input.trim(),
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		// Simulate AI response (in production, this would call your AI endpoint)
		setTimeout(() => {
			const response = generateLocalInsight(userMessage.content);
			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: response,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, assistantMessage]);
			setIsLoading(false);
		}, 1000);
	};

	return (
		<div className="flex h-[calc(100vh-8rem)] flex-col space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/35 px-3 py-1.5 text-sm backdrop-blur">
						<span className="h-1.5 w-1.5 rounded-full bg-chart-3" />
						<span className="text-muted-foreground">Assistant</span>
					</div>
					<h1 className="mt-3 font-semibold text-3xl tracking-tight">
						AI Insights
					</h1>
					<p className="mt-1 text-muted-foreground">
						Ask questions about your trading performance
					</p>
				</div>
				<Button
					asChild
					className="shadow-primary/15 shadow-sm"
					variant="outline"
				>
					<Link href="/settings">
						<Key className="mr-2 h-4 w-4" />
						Configure API keys
					</Link>
				</Button>
			</div>

			{/* API Key Notice */}
			{hasApiKey === false && (
				<Card className="border-primary/50 bg-primary/10">
					<CardContent className="flex items-center justify-between p-4">
						<div className="flex items-center gap-3">
							<Sparkles className="h-5 w-5 text-primary" />
							<div>
								<p className="font-medium">Using Local Analysis</p>
								<p className="text-muted-foreground text-sm">
									Add your AI API key in settings for more advanced insights
								</p>
							</div>
						</div>
						<Button asChild size="sm" variant="outline">
							<Link href="/settings">
								<Settings className="mr-2 h-4 w-4" />
								Settings
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Chat Area */}
			<Card className="flex flex-1 flex-col overflow-hidden">
				<ScrollArea className="flex-1 p-4" ref={scrollRef}>
					{messages.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center text-center">
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
								<Brain className="h-8 w-8 text-primary" />
							</div>
							<h2 className="mb-2 font-semibold text-xl">
								Ask me anything about your trading
							</h2>
							<p className="mb-6 max-w-md text-muted-foreground">
								I can analyze your trades and provide insights on win rates,
								setups, timing, and more.
							</p>
							<div className="flex flex-wrap justify-center gap-2">
								{EXAMPLE_QUERIES.map((query) => (
									<Button
										key={query}
										onClick={() => setInput(query)}
										size="sm"
										variant="outline"
									>
										{query}
									</Button>
								))}
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{messages.map((message) => (
								<div
									className={`flex ${
										message.role === "user" ? "justify-end" : "justify-start"
									}`}
									key={message.id}
								>
									<div
										className={`max-w-[80%] rounded-2xl px-4 py-3 ${
											message.role === "user"
												? "rounded-br-sm bg-primary text-primary-foreground"
												: "rounded-bl-sm bg-secondary"
										}`}
									>
										{message.role === "assistant" ? (
											<div className="prose prose-sm prose-invert max-w-none">
												{message.content.split("\n").map((line) => {
													if (line.startsWith("**") && line.includes(":**")) {
														const [title] = line.split(":**");
														return (
															<p
																className="mt-3 font-semibold first:mt-0"
																key={`heading-${line}`}
															>
																{title?.replace(/\*\*/g, "") ?? ""}:
															</p>
														);
													}
													if (line.startsWith("- **")) {
														return (
															<p className="ml-2 text-sm" key={`bold-${line}`}>
																{line.replace(/\*\*/g, "")}
															</p>
														);
													}
													if (line.startsWith("- ")) {
														return (
															<p
																className="ml-4 text-muted-foreground text-sm"
																key={`bullet-${line}`}
															>
																{line}
															</p>
														);
													}
													return line ? (
														<p className="text-sm" key={`text-${line}`}>
															{line}
														</p>
													) : (
														<br key={`br-${message.id}-${Math.random()}`} />
													);
												})}
											</div>
										) : (
											<p>{message.content}</p>
										)}
									</div>
								</div>
							))}
							{isLoading && (
								<div className="flex justify-start">
									<div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-secondary px-4 py-3">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span className="text-sm">Analyzing your trades...</span>
									</div>
								</div>
							)}
						</div>
					)}
				</ScrollArea>

				{/* Input */}
				<div className="border-t p-4">
					<form
						className="flex gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							handleSend();
						}}
					>
						<Input
							disabled={isLoading}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask about your trading performance..."
							value={input}
						/>
						<Button disabled={isLoading || !input.trim()} type="submit">
							<Send className="h-4 w-4" />
						</Button>
					</form>
				</div>
			</Card>
		</div>
	);
}
