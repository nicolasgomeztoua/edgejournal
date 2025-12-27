"use client";

import {
	AlertTriangle,
	ArrowLeft,
	BookMarked,
	Camera,
	CandlestickChart,
	Check,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Clock,
	ExternalLink,
	Loader2,
	Trash2,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ComplianceBadge, RuleChecklist } from "@/components/playbook";
import { TradeTags } from "@/components/tags/tag-selector";
import {
	EditableField,
	EditableSelect,
	EditableTextarea,
	ExecutionTimeline,
	TradeSummaryCard,
} from "@/components/trade-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/ui/star-rating";
import { useDebouncedMutation } from "@/hooks/use-debounced-mutation";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

// =============================================================================
// CONSTANTS
// =============================================================================

const SETUP_TYPES = [
	{ value: "Breakout", label: "Breakout" },
	{ value: "Reversal", label: "Reversal" },
	{ value: "Trend Continuation", label: "Trend Continuation" },
	{ value: "Range Trade", label: "Range Trade" },
	{ value: "News Trade", label: "News Trade" },
	{ value: "Scalp", label: "Scalp" },
	{ value: "Swing", label: "Swing" },
	{ value: "Gap Fill", label: "Gap Fill" },
	{ value: "Support/Resistance", label: "Support/Resistance" },
	{ value: "Moving Average", label: "Moving Average" },
	{ value: "Other", label: "Other" },
];

const EMOTIONAL_STATES = [
	{ value: "confident", label: "Confident", color: "text-profit" },
	{ value: "fearful", label: "Fearful", color: "text-loss" },
	{ value: "greedy", label: "Greedy", color: "text-breakeven" },
	{ value: "neutral", label: "Neutral", color: "text-muted-foreground" },
	{ value: "frustrated", label: "Frustrated", color: "text-loss" },
	{ value: "excited", label: "Excited", color: "text-accent" },
	{ value: "anxious", label: "Anxious", color: "text-breakeven" },
];

const EXIT_REASONS = [
	{ value: "manual", label: "Manual" },
	{ value: "stop_loss", label: "Stop Loss" },
	{ value: "trailing_stop", label: "Trailing Stop" },
	{ value: "take_profit", label: "Take Profit" },
	{ value: "time_based", label: "Time-Based" },
	{ value: "breakeven", label: "Breakeven" },
];

// =============================================================================
// SECTION COMPONENT
// =============================================================================

function Section({
	label,
	children,
	className,
}: {
	label: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={className}>
			<h2 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
				<span className="h-px w-3 bg-primary/40" />
				<span className="text-primary/80">{label}</span>
			</h2>
			<div className="rounded-sm border-y border-y-white/10 border-r border-r-white/10 border-l-2 border-l-primary/20 bg-secondary p-5">
				{children}
			</div>
		</div>
	);
}

// =============================================================================
// PLAYBOOK SECTION COMPONENT
// =============================================================================

function PlaybookSection({
	tradeId,
	playbookId,
	onPlaybookChange,
}: {
	tradeId: number;
	playbookId: number | null;
	onPlaybookChange: (playbookId: number | null) => void;
}) {
	const utils = api.useUtils();

	// Fetch all playbooks for selector
	const { data: playbooks } = api.playbooks.getAll.useQuery();

	// Fetch rule checks for this trade
	const { data: ruleChecksData } = api.playbooks.getTradeRuleChecks.useQuery(
		{ tradeId },
		{ enabled: !!playbookId },
	);

	const updateTradeMutation = api.trades.update.useMutation({
		onSuccess: () => {
			utils.trades.getById.invalidate({ id: tradeId });
			utils.playbooks.getTradeRuleChecks.invalidate({ tradeId });
		},
		onError: () => {
			toast.error("Failed to update playbook");
		},
	});

	const handlePlaybookChange = (value: string) => {
		const newPlaybookId = value === "none" ? null : parseInt(value, 10);
		onPlaybookChange(newPlaybookId);
		updateTradeMutation.mutate({
			id: tradeId,
			playbookId: newPlaybookId,
		} as Parameters<typeof updateTradeMutation.mutate>[0]);
	};

	return (
		<Section label="Playbook">
			<div className="space-y-4">
				{/* Playbook Selector */}
				<div className="flex items-center gap-4">
					<div className="flex-1">
						<Select
							onValueChange={handlePlaybookChange}
							value={playbookId?.toString() ?? "none"}
						>
							<SelectTrigger className="font-mono">
								<SelectValue placeholder="Select playbook..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">No playbook</SelectItem>
								{playbooks?.map((pb) => (
									<SelectItem key={pb.id} value={pb.id.toString()}>
										<div className="flex items-center gap-2">
											<div
												className="h-2 w-2 rounded-full"
												style={{ backgroundColor: pb.color ?? "#d4ff00" }}
											/>
											{pb.name}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{playbookId && ruleChecksData?.playbook && (
						<div className="flex items-center gap-3">
							<ComplianceBadge
								compliance={ruleChecksData.compliance}
								size="md"
							/>
							<Button asChild size="sm" variant="ghost">
								<Link href={`/playbooks/${playbookId}`}>
									<ExternalLink className="h-3 w-3" />
								</Link>
							</Button>
						</div>
					)}
				</div>

				{/* Rule Checklist */}
				{playbookId && ruleChecksData && ruleChecksData.rules.length > 0 && (
					<RuleChecklist
						checks={ruleChecksData.checks}
						onUpdate={() =>
							utils.playbooks.getTradeRuleChecks.invalidate({ tradeId })
						}
						rules={ruleChecksData.rules}
						tradeId={tradeId}
					/>
				)}

				{/* Empty state when no playbook */}
				{!playbookId && (
					<div className="flex items-center gap-3 rounded border border-white/5 bg-white/[0.01] p-4">
						<BookMarked className="h-5 w-5 text-muted-foreground/50" />
						<div>
							<p className="font-mono text-muted-foreground text-sm">
								No playbook assigned
							</p>
							<p className="font-mono text-[10px] text-muted-foreground/70">
								Assign a playbook to track rule compliance for this trade
							</p>
						</div>
					</div>
				)}

				{/* State when playbook has no rules */}
				{playbookId && ruleChecksData && ruleChecksData.rules.length === 0 && (
					<div className="flex items-center gap-3 rounded border border-white/5 bg-white/[0.01] p-4">
						<BookMarked className="h-5 w-5 text-primary/50" />
						<div>
							<p className="font-mono text-muted-foreground text-sm">
								Playbook has no rules defined
							</p>
							<Link
								className="font-mono text-[10px] text-primary hover:underline"
								href={`/playbooks/${playbookId}`}
							>
								Add rules to this playbook
							</Link>
						</div>
					</div>
				)}
			</div>
		</Section>
	);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TradeDetailPage() {
	const params = useParams();
	const router = useRouter();
	const tradeId = parseInt(params.id as string, 10);

	const [isClosing, setIsClosing] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [closeData, setCloseData] = useState({
		exitPrice: "",
		exitDate: new Date().toISOString().split("T")[0],
		exitTime: new Date().toTimeString().slice(0, 5),
		fees: "",
	});

	const utils = api.useUtils();

	const { data: trade, isLoading } = api.trades.getById.useQuery(
		{ id: tradeId },
		{ enabled: !Number.isNaN(tradeId) },
	);

	// Adjacent trades for navigation
	const { data: adjacentTrades } = api.trades.getAll.useQuery(
		{ limit: 100 },
		{ enabled: !!trade },
	);

	const currentIndex =
		adjacentTrades?.items.findIndex((t) => t.id === tradeId) ?? -1;
	const prevTrade =
		currentIndex > 0 ? adjacentTrades?.items[currentIndex - 1] : null;
	const nextTrade =
		currentIndex >= 0 && adjacentTrades?.items[currentIndex + 1]
			? adjacentTrades.items[currentIndex + 1]
			: null;

	// Optimistic update helper
	type TradeData = typeof trade;
	const optimisticUpdate = useCallback(
		(updates: Partial<NonNullable<TradeData>>) => {
			utils.trades.getById.setData({ id: tradeId }, (old) => {
				if (!old) return old;
				return { ...old, ...updates };
			});
		},
		[tradeId, utils.trades.getById],
	);

	// Mutations
	const updateTrade = api.trades.update.useMutation({
		onMutate: async (newData) => {
			await utils.trades.getById.cancel({ id: tradeId });
			const previousTrade = utils.trades.getById.getData({ id: tradeId });
			optimisticUpdate(newData as Partial<NonNullable<TradeData>>);
			return { previousTrade };
		},
		onError: (error, _newData, context) => {
			if (context?.previousTrade) {
				utils.trades.getById.setData({ id: tradeId }, context.previousTrade);
			}
			toast.error(error.message || "Failed to update");
		},
	});

	const updateRatingMutation = api.trades.updateRating.useMutation({
		onError: () => {
			toast.error("Failed to update rating");
		},
	});

	const [pendingRating, setPendingRating] = useState<number | null>(null);

	const { trigger: updateRating } = useDebouncedMutation({
		mutationFn: (rating: number) => {
			updateRatingMutation.mutate({ id: tradeId, rating });
			setPendingRating(null);
		},
		onOptimisticUpdate: (rating) => {
			setPendingRating(rating);
			optimisticUpdate({ rating });
		},
		delay: 300,
	});

	const markReviewed = api.trades.markReviewed.useMutation({
		onMutate: async ({ isReviewed }) => {
			await utils.trades.getById.cancel({ id: tradeId });
			const previousTrade = utils.trades.getById.getData({ id: tradeId });
			optimisticUpdate({ isReviewed });
			return { previousTrade };
		},
		onError: (_error, _newData, context) => {
			if (context?.previousTrade) {
				utils.trades.getById.setData({ id: tradeId }, context.previousTrade);
			}
			toast.error("Failed to update review status");
		},
	});

	const closeTrade = api.trades.close.useMutation({
		onSuccess: () => {
			toast.success("Trade closed");
			setIsClosing(false);
			utils.trades.getById.invalidate({ id: tradeId });
			utils.trades.getAll.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to close trade");
		},
	});

	const deleteTrade = api.trades.delete.useMutation({
		onSuccess: () => {
			toast.success("Trade deleted");
			utils.trades.getAll.invalidate();
			router.push("/journal");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete trade");
		},
	});

	// Field update handler
	const updateField = useCallback(
		(field: string, value: string | number | boolean | null) => {
			updateTrade.mutate({
				id: tradeId,
				[field]: value === "" ? null : value,
			});
		},
		[tradeId, updateTrade],
	);

	const handleCloseTrade = () => {
		const exitTime = new Date(
			`${closeData.exitDate}T${closeData.exitTime}`,
		).toISOString();
		closeTrade.mutate({
			id: tradeId,
			exitPrice: closeData.exitPrice,
			exitTime,
			fees: closeData.fees || undefined,
		});
	};

	// Calculate stats
	const stats = (() => {
		if (!trade) return null;
		const entry = parseFloat(trade.entryPrice);
		const exit = trade.exitPrice ? parseFloat(trade.exitPrice) : null;
		const sl = trade.stopLoss ? parseFloat(trade.stopLoss) : null;
		const tp = trade.takeProfit ? parseFloat(trade.takeProfit) : null;
		const isLong = trade.direction === "long";

		const riskPips = sl ? Math.abs(entry - sl) : null;
		const rewardPips = tp ? Math.abs(tp - entry) : null;
		const rrRatio = riskPips && rewardPips ? rewardPips / riskPips : null;

		let rMultiple: number | null = null;
		if (exit && riskPips) {
			const pnlPips = isLong ? exit - entry : entry - exit;
			rMultiple = pnlPips / riskPips;
		}

		// Calculate target hit percentage
		let targetHitPercent: number | null = null;
		if (exit && tp && sl) {
			const maxReward = Math.abs(tp - entry);
			const actualReward = isLong ? exit - entry : entry - exit;
			if (maxReward > 0) {
				targetHitPercent = (actualReward / maxReward) * 100;
			}
		}

		let duration: string | null = null;
		if (trade.exitTime && trade.entryTime) {
			const ms =
				new Date(trade.exitTime).getTime() -
				new Date(trade.entryTime).getTime();
			const hours = Math.floor(ms / (1000 * 60 * 60));
			const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
			if (hours > 24) {
				const days = Math.floor(hours / 24);
				duration = `${days}d ${hours % 24}h`;
			} else if (hours > 0) {
				duration = `${hours}h ${minutes}m`;
			} else {
				duration = `${minutes}m`;
			}
		}

		return {
			riskPips,
			rewardPips,
			rrRatio,
			rMultiple,
			targetHitPercent,
			duration,
		};
	})();

	// Loading state
	if (isLoading) {
		return (
			<div className="mx-auto w-[95%] max-w-none space-y-6 py-6">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-24" />
				<Skeleton className="h-32" />
				<Skeleton className="h-32" />
			</div>
		);
	}

	// Not found
	if (!trade) {
		return (
			<div className="flex flex-col items-center justify-center py-24">
				<AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
				<h2 className="font-semibold text-xl">Trade not found</h2>
				<p className="mb-4 text-muted-foreground">
					This trade doesn&apos;t exist or you don&apos;t have access.
				</p>
				<Button asChild>
					<Link href="/journal">Back to Journal</Link>
				</Button>
			</div>
		);
	}

	const sizeLabel = trade.instrumentType === "futures" ? "cts" : "lots";

	return (
		<div className="mx-auto w-[95%] max-w-none space-y-8 py-6">
			{/* ================================================================
			    STICKY HEADER
			    ================================================================ */}
			<div className="sticky top-0 z-10 flex items-center justify-between border-border border-b bg-background/95 py-3 backdrop-blur">
				<div className="flex items-center gap-3">
					<Button asChild className="h-8 w-8" size="icon" variant="ghost">
						<Link href="/journal">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<span className="font-mono text-muted-foreground text-xs">
						Back to Journal
					</span>
				</div>

				<div className="flex items-center gap-4">
					{/* Rating */}
					<StarRating
						onChange={(rating) => updateRating(rating ?? 0)}
						size="sm"
						value={pendingRating ?? trade.rating ?? 0}
					/>

					{/* Reviewed toggle */}
					<button
						className={cn(
							"flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
							trade.isReviewed
								? "bg-profit/10 text-profit"
								: "text-muted-foreground hover:bg-white/5",
						)}
						onClick={() =>
							markReviewed.mutate({
								id: tradeId,
								isReviewed: !trade.isReviewed,
							})
						}
						type="button"
					>
						{trade.isReviewed ? (
							<CheckCircle2 className="h-3 w-3" />
						) : (
							<Clock className="h-3 w-3" />
						)}
						{trade.isReviewed ? "Reviewed" : "Review"}
					</button>

					{/* Navigation */}
					<div className="flex items-center gap-1">
						{prevTrade ? (
							<Button asChild className="h-7 w-7" size="icon" variant="ghost">
								<Link href={`/journal/${prevTrade.id}`}>
									<ChevronLeft className="h-4 w-4" />
								</Link>
							</Button>
						) : (
							<Button className="h-7 w-7" disabled size="icon" variant="ghost">
								<ChevronLeft className="h-4 w-4" />
							</Button>
						)}
						{nextTrade ? (
							<Button asChild className="h-7 w-7" size="icon" variant="ghost">
								<Link href={`/journal/${nextTrade.id}`}>
									<ChevronRight className="h-4 w-4" />
								</Link>
							</Button>
						) : (
							<Button className="h-7 w-7" disabled size="icon" variant="ghost">
								<ChevronRight className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* ================================================================
			    TRADE IDENTITY
			    ================================================================ */}
			<div>
				<div className="flex items-center gap-3">
					{/* Direction icon */}
					<div
						className={cn(
							"flex h-10 w-10 items-center justify-center rounded",
							trade.direction === "long"
								? "bg-profit/10 text-profit"
								: "bg-loss/10 text-loss",
						)}
					>
						{trade.direction === "long" ? (
							<TrendingUp className="h-5 w-5" />
						) : (
							<TrendingDown className="h-5 w-5" />
						)}
					</div>

					{/* Symbol & badges */}
					<div>
						<div className="flex items-center gap-2">
							<h1 className="font-bold font-mono text-2xl tracking-tight">
								{trade.symbol}
							</h1>
							<Badge
								className={cn(
									"font-mono text-[10px] uppercase",
									trade.direction === "long"
										? "border-profit/30 text-profit"
										: "border-loss/30 text-loss",
								)}
								variant="outline"
							>
								{trade.direction}
							</Badge>
							<Badge
								className="font-mono text-[10px] uppercase"
								variant={trade.status === "open" ? "secondary" : "outline"}
							>
								{trade.status === "open" ? (
									<Clock className="mr-1 h-3 w-3" />
								) : (
									<Check className="mr-1 h-3 w-3" />
								)}
								{trade.status}
							</Badge>
						</div>
						<p className="mt-0.5 font-mono text-muted-foreground text-xs">
							{new Date(trade.entryTime).toLocaleDateString("en-US", {
								weekday: "short",
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
							{stats?.duration && (
								<span className="text-muted-foreground/50">
									{" "}
									· {stats.duration}
								</span>
							)}
							{trade.account?.name && (
								<span className="text-muted-foreground/50">
									{" "}
									· {trade.account.name}
								</span>
							)}
						</p>
					</div>
				</div>
			</div>

			{/* ================================================================
			    SUMMARY CARD
			    ================================================================ */}
			<TradeSummaryCard
				netPnl={trade.netPnl}
				rMultiple={stats?.rMultiple ?? null}
				rrRatio={stats?.rrRatio ?? null}
				status={trade.status}
				targetHitPercent={stats?.targetHitPercent ?? null}
			/>

			{/* ================================================================
			    CHART
			    ================================================================ */}
			<Section label="Chart">
				<div className="relative aspect-[21/9] w-full overflow-hidden rounded bg-secondary">
					{/* Placeholder grid background */}
					<div
						className="absolute inset-0 opacity-20"
						style={{
							backgroundImage: `
								linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
								linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
							`,
							backgroundSize: "40px 20px",
						}}
					/>

					{/* Entry/Exit markers placeholder */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="relative flex w-full items-center px-12">
							{/* Simulated price line */}
							<div className="absolute top-1/2 right-12 left-12 h-px bg-gradient-to-r from-profit/50 via-white/30 to-loss/50" />

							{/* Entry marker */}
							<div className="absolute left-[20%] flex flex-col items-center">
								<div className="mb-1 font-mono text-[10px] text-profit">
									ENTRY
								</div>
								<div className="flex h-6 w-6 items-center justify-center rounded-full border border-profit bg-profit/20">
									<TrendingUp className="h-3 w-3 text-profit" />
								</div>
								<div className="mt-1 font-mono text-[10px] text-muted-foreground">
									{trade.entryPrice}
								</div>
							</div>

							{/* Exit marker (if closed) */}
							{trade.status === "closed" && trade.exitPrice && (
								<div className="absolute left-[80%] flex flex-col items-center">
									<div className="mb-1 font-mono text-[10px] text-loss">
										EXIT
									</div>
									<div className="flex h-6 w-6 items-center justify-center rounded-full border border-loss bg-loss/20">
										<TrendingDown className="h-3 w-3 text-loss" />
									</div>
									<div className="mt-1 font-mono text-[10px] text-muted-foreground">
										{trade.exitPrice}
									</div>
								</div>
							)}

							{/* Stop loss line */}
							{trade.stopLoss && (
								<div className="absolute top-[70%] right-12 flex items-center gap-2">
									<div className="h-px w-full border-loss/50 border-t border-dashed" />
									<span className="whitespace-nowrap font-mono text-[9px] text-loss/70">
										SL {trade.stopLoss}
									</span>
								</div>
							)}

							{/* Take profit line */}
							{trade.takeProfit && (
								<div className="absolute top-[30%] right-12 flex items-center gap-2">
									<div className="h-px w-full border-profit/50 border-t border-dashed" />
									<span className="whitespace-nowrap font-mono text-[9px] text-profit/70">
										TP {trade.takeProfit}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Coming soon overlay */}
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]">
						<CandlestickChart className="mb-3 h-10 w-10 text-primary/60" />
						<p className="font-mono text-sm text-white/80">Interactive Chart</p>
						<p className="font-mono text-[10px] text-muted-foreground">
							TradingView integration coming soon
						</p>
					</div>
				</div>
			</Section>

			{/* ================================================================
			    POSITION
			    ================================================================ */}
			<Section label="Position">
				<div className="grid grid-cols-3 gap-4">
					<EditableField
						align="right"
						label="Entry Price"
						onChange={(v) => updateField("entryPrice", v)}
						type="number"
						value={trade.entryPrice}
					/>
					<EditableField
						align="right"
						label="Exit Price"
						onChange={(v) => updateField("exitPrice", v)}
						placeholder={trade.status === "open" ? "Open" : "—"}
						type="number"
						value={trade.exitPrice}
					/>
					<EditableField
						align="right"
						label="Size"
						onChange={(v) => updateField("quantity", v)}
						suffix={` ${sizeLabel}`}
						type="number"
						value={trade.quantity}
					/>
				</div>
			</Section>

			{/* ================================================================
			    RISK MANAGEMENT
			    ================================================================ */}
			<Section label="Risk Management">
				<div className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<EditableField
							align="right"
							label="Stop Loss"
							onChange={(v) => updateField("stopLoss", v)}
							type="number"
							value={trade.stopLoss}
						/>
						<EditableField
							align="right"
							label="Take Profit"
							onChange={(v) => updateField("takeProfit", v)}
							type="number"
							value={trade.takeProfit}
						/>
						<EditableField
							align="right"
							label="Fees"
							onChange={(v) => updateField("fees", v)}
							prefix="$"
							type="number"
							value={trade.fees}
						/>
					</div>

					{/* Trailing Stop Toggle */}
					<div className="border-border border-t pt-4">
						<div className="flex items-center gap-3">
							<Checkbox
								checked={trade.wasTrailed ?? false}
								id="was-trailed"
								onCheckedChange={(checked) => {
									updateField("wasTrailed", checked === true);
									if (!checked) {
										updateField("trailedStopLoss", null);
									}
								}}
							/>
							<label
								className="font-mono text-muted-foreground text-sm"
								htmlFor="was-trailed"
							>
								Stop was trailed
							</label>
							{trade.wasTrailed && (
								<EditableField
									align="right"
									className="ml-auto w-32"
									onChange={(v) => updateField("trailedStopLoss", v)}
									placeholder="Trailed to..."
									type="number"
									value={trade.trailedStopLoss}
								/>
							)}
						</div>
					</div>
				</div>
			</Section>

			{/* ================================================================
			    EXECUTIONS
			    ================================================================ */}
			<Section label="Executions">
				<ExecutionTimeline
					executions={
						trade.executions?.map((e) => ({
							id: e.id,
							// Map old types: scale_in → entry, scale_out → exit
							executionType:
								e.executionType === "scale_in" || e.executionType === "entry"
									? ("entry" as const)
									: ("exit" as const),
							price: e.price,
							quantity: e.quantity,
							executedAt: e.executedAt,
							fees: e.fees,
							realizedPnl: e.realizedPnl,
							notes: e.notes,
						})) ?? []
					}
					instrumentType={trade.instrumentType}
					onAddExecution={(execution) => {
						// TODO: Implement add execution mutation
						console.log("Add execution:", execution);
						toast.info("Add execution coming soon");
					}}
				/>
			</Section>

			{/* ================================================================
			    CONTEXT
			    ================================================================ */}
			<Section label="Context">
				<div className="grid grid-cols-3 gap-4">
					<EditableSelect
						label="Setup Type"
						onChange={(v) => updateField("setupType", v)}
						options={SETUP_TYPES}
						placeholder="Select setup..."
						value={trade.setupType}
					/>
					<EditableSelect
						label="Emotional State"
						onChange={(v) => updateField("emotionalState", v)}
						options={EMOTIONAL_STATES}
						placeholder="Select state..."
						value={trade.emotionalState}
					/>
					<EditableSelect
						label="Exit Reason"
						onChange={(v) => updateField("exitReason", v)}
						options={EXIT_REASONS}
						placeholder="Select reason..."
						value={trade.exitReason}
					/>
				</div>
			</Section>

			{/* ================================================================
			    PLAYBOOK
			    ================================================================ */}
			<PlaybookSection
				onPlaybookChange={(playbookId) => updateField("playbookId", playbookId)}
				playbookId={trade.playbookId}
				tradeId={tradeId}
			/>

			{/* ================================================================
			    TAGS
			    ================================================================ */}
			<Section label="Tags">
				<TradeTags
					maxDisplay={10}
					onUpdate={() => utils.trades.getById.invalidate({ id: tradeId })}
					tags={trade.tradeTags}
					tradeId={tradeId}
				/>
			</Section>

			{/* ================================================================
			    NOTES
			    ================================================================ */}
			<Section label="Notes">
				<EditableTextarea
					onChange={(v) => updateField("notes", v)}
					placeholder="Add notes about this trade..."
					rows={6}
					value={trade.notes}
				/>
			</Section>

			{/* ================================================================
			    SCREENSHOTS (Placeholder)
			    ================================================================ */}
			<Section label="Screenshots">
				<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
					<Camera className="mb-2 h-8 w-8 opacity-50" />
					<p className="font-mono text-xs">Drop images or click to upload</p>
					<p className="font-mono text-[10px] opacity-50">Coming soon</p>
				</div>
			</Section>

			{/* ================================================================
			    ACTIONS
			    ================================================================ */}
			<div className="flex items-center justify-between border-border border-t pt-6">
				{trade.status === "open" && (
					<Button
						className="font-mono text-xs uppercase tracking-wider"
						onClick={() => setIsClosing(true)}
					>
						Close Trade
					</Button>
				)}
				<div className={cn(trade.status === "closed" && "ml-auto")}>
					<Button
						className="font-mono text-muted-foreground text-xs uppercase tracking-wider hover:text-loss"
						onClick={() => setIsDeleting(true)}
						variant="ghost"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Trade
					</Button>
				</div>
			</div>

			{/* ================================================================
			    DIALOGS
			    ================================================================ */}

			{/* Close Trade Dialog */}
			<Dialog onOpenChange={setIsClosing} open={isClosing}>
				<DialogContent className="border-border bg-background">
					<DialogHeader>
						<DialogTitle className="font-mono uppercase tracking-wider">
							Close Trade
						</DialogTitle>
						<DialogDescription className="font-mono text-xs">
							Enter exit details for {trade.symbol} {trade.direction}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-1">
							<label
								className="font-mono text-[11px] text-muted-foreground uppercase"
								htmlFor="close-exit-price"
							>
								Exit Price
							</label>
							<Input
								className="font-mono"
								id="close-exit-price"
								onChange={(e) =>
									setCloseData({ ...closeData, exitPrice: e.target.value })
								}
								placeholder="0.00"
								step="any"
								type="number"
								value={closeData.exitPrice}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<label
									className="font-mono text-[11px] text-muted-foreground uppercase"
									htmlFor="close-exit-date"
								>
									Date
								</label>
								<Input
									id="close-exit-date"
									onChange={(e) =>
										setCloseData({ ...closeData, exitDate: e.target.value })
									}
									type="date"
									value={closeData.exitDate}
								/>
							</div>
							<div className="space-y-1">
								<label
									className="font-mono text-[11px] text-muted-foreground uppercase"
									htmlFor="close-exit-time"
								>
									Time
								</label>
								<Input
									id="close-exit-time"
									onChange={(e) =>
										setCloseData({ ...closeData, exitTime: e.target.value })
									}
									type="time"
									value={closeData.exitTime}
								/>
							</div>
						</div>
						<div className="space-y-1">
							<label
								className="font-mono text-[11px] text-muted-foreground uppercase"
								htmlFor="close-fees"
							>
								Fees (optional)
							</label>
							<Input
								className="font-mono"
								id="close-fees"
								onChange={(e) =>
									setCloseData({ ...closeData, fees: e.target.value })
								}
								placeholder="0.00"
								step="any"
								type="number"
								value={closeData.fees}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={() => setIsClosing(false)} variant="ghost">
							Cancel
						</Button>
						<Button
							disabled={!closeData.exitPrice || closeTrade.isPending}
							onClick={handleCloseTrade}
						>
							{closeTrade.isPending && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Close Trade
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<Dialog onOpenChange={setIsDeleting} open={isDeleting}>
				<DialogContent className="border-border bg-background">
					<DialogHeader>
						<DialogTitle className="font-mono uppercase tracking-wider">
							Delete Trade
						</DialogTitle>
						<DialogDescription className="font-mono text-xs">
							This will move the trade to trash. You can restore it later.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => setIsDeleting(false)} variant="ghost">
							Cancel
						</Button>
						<Button
							disabled={deleteTrade.isPending}
							onClick={() => deleteTrade.mutate({ id: tradeId })}
							variant="destructive"
						>
							{deleteTrade.isPending && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
