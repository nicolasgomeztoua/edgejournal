"use client";

import {
	AlertTriangle,
	ArrowLeft,
	Camera,
	Check,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Clock,
	FileText,
	Loader2,
	Target,
	Trash2,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TradeTags } from "@/components/tags/tag-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useDebouncedMutation } from "@/hooks/use-debounced-mutation";
import { cn, formatCurrency, getPnLColorClass } from "@/lib/utils";
import { api } from "@/trpc/react";

// ============================================================================
// INLINE EDITABLE COMPONENTS
// ============================================================================

interface EditableNumberProps {
	value: string | null | undefined;
	onSave: (value: string) => void;
	placeholder?: string;
	prefix?: string;
	suffix?: string;
	className?: string;
	format?: (val: string) => string;
	decimals?: number;
}

// Helper to format number with clean decimals
function formatEditValue(val: string | null | undefined, decimals = 2): string {
	if (!val) return "";
	const num = parseFloat(val);
	if (Number.isNaN(num)) return "";
	// Use fixed decimals but trim trailing zeros
	const fixed = num.toFixed(decimals);
	// Remove unnecessary trailing zeros while keeping at least 2 decimals for prices
	return parseFloat(fixed).toString();
}

function EditableNumber({
	value,
	onSave,
	placeholder = "—",
	prefix = "",
	suffix = "",
	className = "",
	format,
	decimals = 2,
}: EditableNumberProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditing]);

	const handleSave = () => {
		const cleanValue = editValue.trim();
		if (cleanValue !== (value ?? "")) {
			onSave(cleanValue);
		}
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSave();
		} else if (e.key === "Escape") {
			setEditValue(formatEditValue(value, decimals));
			setIsEditing(false);
		}
	};

	// Only allow numeric input
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		// Allow empty, numbers, one decimal point, and negative
		if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
			setEditValue(val);
		}
	};

	if (isEditing) {
		return (
			<input
				className={cn(
					"h-8 w-32 rounded border border-white/20 bg-white/5 px-2 font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary",
					className,
				)}
				inputMode="decimal"
				onBlur={handleSave}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				ref={inputRef}
				type="text"
				value={editValue}
			/>
		);
	}

	const displayValue = value
		? format
			? format(value)
			: `${prefix}${parseFloat(value).toLocaleString(undefined, {
					minimumFractionDigits: 0,
					maximumFractionDigits: decimals,
				})}${suffix}`
		: placeholder;

	return (
		<button
			className={cn(
				"rounded px-2 py-1 text-left font-mono transition-colors hover:bg-white/5",
				!value && "text-muted-foreground",
				className,
			)}
			onClick={() => {
				setEditValue(formatEditValue(value, decimals));
				setIsEditing(true);
			}}
			type="button"
		>
			{displayValue}
		</button>
	);
}

interface EditableTextProps {
	value: string | null | undefined;
	onSave: (value: string) => void;
	placeholder?: string;
	className?: string;
	multiline?: boolean;
}

function EditableText({
	value,
	onSave,
	placeholder = "Click to add...",
	className = "",
	multiline = false,
}: EditableTextProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(value ?? "");
	const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	const handleSave = () => {
		if (editValue !== value) {
			onSave(editValue);
		}
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setEditValue(value ?? "");
			setIsEditing(false);
		}
		if (e.key === "Enter" && !multiline) {
			handleSave();
		}
	};

	if (isEditing) {
		if (multiline) {
			return (
				<Textarea
					className={cn("min-h-[120px] font-mono text-sm", className)}
					onBlur={handleSave}
					onChange={(e) => setEditValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					ref={inputRef as React.RefObject<HTMLTextAreaElement>}
					value={editValue}
				/>
			);
		}
		return (
			<Input
				className={cn("h-8 font-mono text-sm", className)}
				onBlur={handleSave}
				onChange={(e) => setEditValue(e.target.value)}
				onKeyDown={handleKeyDown}
				ref={inputRef as React.RefObject<HTMLInputElement>}
				value={editValue}
			/>
		);
	}

	return (
		<button
			className={cn(
				"w-full rounded px-2 py-1 text-left transition-colors hover:bg-white/5",
				!value && "text-muted-foreground italic",
				multiline && "min-h-[80px]",
				className,
			)}
			onClick={() => {
				setEditValue(value ?? "");
				setIsEditing(true);
			}}
			type="button"
		>
			{value || placeholder}
		</button>
	);
}

// ============================================================================
// SETUP TYPES & EMOTIONAL STATES
// ============================================================================

const SETUP_TYPES = [
	"Breakout",
	"Reversal",
	"Trend Continuation",
	"Range Trade",
	"News Trade",
	"Scalp",
	"Swing",
	"Gap Fill",
	"Support/Resistance",
	"Moving Average",
	"Other",
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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

	// Mutations with optimistic updates
	const updateTrade = api.trades.update.useMutation({
		onMutate: async (newData) => {
			// Cancel outgoing refetches
			await utils.trades.getById.cancel({ id: tradeId });
			// Snapshot previous value
			const previousTrade = utils.trades.getById.getData({ id: tradeId });
			// Optimistically update
			optimisticUpdate(newData as Partial<NonNullable<TradeData>>);
			return { previousTrade };
		},
		onError: (error, _newData, context) => {
			// Roll back on error
			if (context?.previousTrade) {
				utils.trades.getById.setData({ id: tradeId }, context.previousTrade);
			}
			toast.error(error.message || "Failed to update");
		},
		// No onSettled invalidation - cache already has correct data from optimistic update
		// Only refetch if you need computed fields from server
	});

	const updateRatingMutation = api.trades.updateRating.useMutation({
		onError: () => {
			toast.error("Failed to update rating");
		},
	});

	// Debounced rating to prevent race conditions on rapid clicks
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
				[field]: value || undefined,
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

		let rMultiple = null;
		if (exit && riskPips) {
			const pnlPips = isLong ? exit - entry : entry - exit;
			rMultiple = pnlPips / riskPips;
		}

		let duration = null;
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

		return { riskPips, rewardPips, rrRatio, rMultiple, duration };
	})();

	// Loading state
	if (isLoading) {
		return (
			<div className="mx-auto max-w-5xl space-y-6 p-6">
				<Skeleton className="h-12 w-64" />
				<Skeleton className="h-48" />
				<div className="grid gap-4 md:grid-cols-3">
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
				</div>
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

	const pnl = trade.netPnl ? parseFloat(trade.netPnl) : null;
	const isProfit = pnl !== null && pnl > 0;
	const isLoss = pnl !== null && pnl < 0;

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			{/* ================================================================
			    TOP NAVIGATION BAR
			    ================================================================ */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button asChild className="h-8 w-8" size="icon" variant="ghost">
						<Link href="/journal">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<span className="font-mono text-muted-foreground text-xs">
						Back to Journal
					</span>
				</div>

				{/* Trade Navigation */}
				<div className="flex items-center gap-2">
					{prevTrade ? (
						<Button
							asChild
							className="h-8 gap-1 px-2"
							size="sm"
							variant="ghost"
						>
							<Link href={`/journal/${prevTrade.id}`}>
								<ChevronLeft className="h-4 w-4" />
								<span className="hidden font-mono text-xs sm:inline">
									{prevTrade.symbol}
								</span>
							</Link>
						</Button>
					) : (
						<Button className="h-8 px-2" disabled size="sm" variant="ghost">
							<ChevronLeft className="h-4 w-4" />
						</Button>
					)}
					{nextTrade ? (
						<Button
							asChild
							className="h-8 gap-1 px-2"
							size="sm"
							variant="ghost"
						>
							<Link href={`/journal/${nextTrade.id}`}>
								<span className="hidden font-mono text-xs sm:inline">
									{nextTrade.symbol}
								</span>
								<ChevronRight className="h-4 w-4" />
							</Link>
						</Button>
					) : (
						<Button className="h-8 px-2" disabled size="sm" variant="ghost">
							<ChevronRight className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			{/* ================================================================
			    HERO SECTION - Symbol, Direction, P&L
			    ================================================================ */}
			<div
				className={cn(
					"relative overflow-hidden rounded border p-6",
					trade.status === "closed" && pnl !== null
						? isProfit
							? "border-profit/20 bg-gradient-to-br from-profit/5 via-transparent to-transparent"
							: isLoss
								? "border-loss/20 bg-gradient-to-br from-loss/5 via-transparent to-transparent"
								: "border-white/10 bg-white/[0.02]"
						: "border-white/10 bg-white/[0.02]",
				)}
			>
				{/* Background glow */}
				<div
					className={cn(
						"-right-20 -top-20 pointer-events-none absolute h-40 w-40 rounded-full blur-[80px]",
						isProfit ? "bg-profit/20" : isLoss ? "bg-loss/20" : "bg-primary/10",
					)}
				/>

				<div className="relative flex flex-wrap items-start justify-between gap-6">
					{/* Left: Symbol & Direction */}
					<div className="flex items-center gap-4">
						<div
							className={cn(
								"flex h-16 w-16 items-center justify-center rounded",
								trade.direction === "long"
									? "bg-profit/10 ring-1 ring-profit/30"
									: "bg-loss/10 ring-1 ring-loss/30",
							)}
						>
							{trade.direction === "long" ? (
								<TrendingUp className="h-8 w-8 text-profit" />
							) : (
								<TrendingDown className="h-8 w-8 text-loss" />
							)}
						</div>
						<div>
							<div className="flex items-center gap-3">
								<h1 className="font-bold font-mono text-3xl tracking-tight">
									{trade.symbol}
								</h1>
								<Badge
									className={cn(
										"font-mono text-[10px] uppercase tracking-wider",
										trade.direction === "long"
											? "border-profit/30 bg-profit/10 text-profit"
											: "border-loss/30 bg-loss/10 text-loss",
									)}
									variant="outline"
								>
									{trade.direction}
								</Badge>
								<Badge
									className="font-mono text-[10px] uppercase tracking-wider"
									variant={trade.status === "open" ? "secondary" : "default"}
								>
									{trade.status === "open" ? (
										<Clock className="mr-1 h-3 w-3" />
									) : (
										<Check className="mr-1 h-3 w-3" />
									)}
									{trade.status}
								</Badge>
							</div>
							<p className="mt-1 font-mono text-muted-foreground text-xs">
								{trade.instrumentType.toUpperCase()}
								{trade.setupType && ` · ${trade.setupType}`}
								{stats?.duration && ` · ${stats.duration}`}
							</p>
						</div>
					</div>

					{/* Right: P&L (if closed) */}
					{trade.status === "closed" && pnl !== null && (
						<div className="text-right">
							<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Net P&L
							</p>
							<p
								className={cn(
									"font-bold font-mono text-4xl tracking-tight",
									getPnLColorClass(trade.netPnl),
								)}
							>
								{pnl >= 0 ? "+" : ""}
								{formatCurrency(pnl)}
							</p>
							{stats && stats.rMultiple != null && (
								<p
									className={cn(
										"mt-1 font-mono text-sm",
										stats.rMultiple >= 0 ? "text-profit" : "text-loss",
									)}
								>
									{stats.rMultiple >= 0 ? "+" : ""}
									{stats.rMultiple.toFixed(2)}R
								</p>
							)}
						</div>
					)}
				</div>

				{/* Rating & Review Row */}
				<div className="mt-4 flex items-center justify-between border-white/5 border-t pt-4">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Rating
							</span>
							<StarRating
								onChange={(rating) => updateRating(rating ?? 0)}
								size="md"
								value={pendingRating ?? trade.rating ?? 0}
							/>
						</div>
						<button
							className={cn(
								"flex items-center gap-2 rounded px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
								trade.isReviewed
									? "bg-profit/10 text-profit"
									: "bg-white/5 text-muted-foreground hover:bg-white/10",
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
								<CheckCircle2 className="h-3.5 w-3.5" />
							) : (
								<Clock className="h-3.5 w-3.5" />
							)}
							{trade.isReviewed ? "Reviewed" : "Mark Reviewed"}
						</button>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2">
						{trade.status === "open" && (
							<Button
								className="font-mono text-xs uppercase tracking-wider"
								onClick={() => setIsClosing(true)}
								size="sm"
							>
								Close Trade
							</Button>
						)}
						<Button
							className="h-8 w-8 text-muted-foreground hover:text-destructive"
							onClick={() => setIsDeleting(true)}
							size="icon"
							variant="ghost"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* ================================================================
			    MAIN GRID - 3 Column Layout
			    ================================================================ */}
			<div className="grid gap-4 lg:grid-cols-3">
				{/* ============================================================
				    COLUMN 1: Entry & Exit
				    ============================================================ */}
				<div className="space-y-4">
					{/* Entry Card */}
					<div className="rounded border border-white/5 bg-white/[0.02] p-4">
						<div className="mb-3 flex items-center gap-2">
							<div className="flex h-6 w-6 items-center justify-center rounded bg-profit/10">
								<TrendingUp className="h-3.5 w-3.5 text-profit" />
							</div>
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Entry
							</span>
						</div>
						<div className="space-y-3">
							<div>
								<span className="font-mono text-[10px] text-muted-foreground uppercase">
									Price
								</span>
								<EditableNumber
									className="block font-bold text-xl"
									onSave={(v) => updateField("entryPrice", v)}
									value={trade.entryPrice}
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<span className="font-mono text-[10px] text-muted-foreground uppercase">
										Date
									</span>
									<p className="font-mono text-sm">
										{new Date(trade.entryTime).toLocaleDateString()}
									</p>
								</div>
								<div>
									<span className="font-mono text-[10px] text-muted-foreground uppercase">
										Time
									</span>
									<p className="font-mono text-sm">
										{new Date(trade.entryTime).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</p>
								</div>
							</div>
							<div>
								<span className="font-mono text-[10px] text-muted-foreground uppercase">
									Size
								</span>
								<EditableNumber
									className="block text-sm"
									onSave={(v) => updateField("quantity", v)}
									suffix={trade.instrumentType === "futures" ? " cts" : " lots"}
									value={trade.quantity}
								/>
							</div>
						</div>
					</div>

					{/* Exit Card */}
					<div className="rounded border border-white/5 bg-white/[0.02] p-4">
						<div className="mb-3 flex items-center gap-2">
							<div className="flex h-6 w-6 items-center justify-center rounded bg-white/10">
								<Target className="h-3.5 w-3.5 text-muted-foreground" />
							</div>
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Exit
							</span>
						</div>
						{trade.status === "open" ? (
							<p className="py-4 text-center font-mono text-muted-foreground text-sm">
								Position still open
							</p>
						) : (
							<div className="space-y-3">
								<div>
									<span className="font-mono text-[10px] text-muted-foreground uppercase">
										Price
									</span>
									<EditableNumber
										className="block font-bold text-xl"
										onSave={(v) => updateField("exitPrice", v)}
										value={trade.exitPrice}
									/>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<span className="font-mono text-[10px] text-muted-foreground uppercase">
											Date
										</span>
										<p className="font-mono text-sm">
											{trade.exitTime
												? new Date(trade.exitTime).toLocaleDateString()
												: "—"}
										</p>
									</div>
									<div>
										<span className="font-mono text-[10px] text-muted-foreground uppercase">
											Fees
										</span>
										<EditableNumber
											className="block text-sm"
											onSave={(v) => updateField("fees", v)}
											prefix="$"
											value={trade.fees}
										/>
									</div>
								</div>
								<div>
									<span className="font-mono text-[10px] text-muted-foreground uppercase">
										Exit Reason
									</span>
									<Select
										onValueChange={(v) => updateField("exitReason", v)}
										value={trade.exitReason ?? ""}
									>
										<SelectTrigger className="mt-1 h-8 font-mono text-xs">
											<SelectValue placeholder="Select reason" />
										</SelectTrigger>
										<SelectContent>
											{EXIT_REASONS.map((r) => (
												<SelectItem key={r.value} value={r.value}>
													{r.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* ============================================================
				    COLUMN 2: Risk Management & Stats
				    ============================================================ */}
				<div className="space-y-4">
					{/* Risk Management */}
					<div className="rounded border border-primary/10 bg-primary/[0.02] p-4">
						<div className="mb-3 flex items-center gap-2">
							<div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
								<Target className="h-3.5 w-3.5 text-primary" />
							</div>
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Risk Management
							</span>
						</div>
						<div className="space-y-3">
							<div className="grid grid-cols-2 gap-3">
								<div>
									<span className="font-mono text-[10px] text-muted-foreground uppercase">
										Stop Loss
									</span>
									<EditableNumber
										className={cn(
											"block font-semibold text-lg",
											trade.stopLoss ? "text-loss" : "",
										)}
										onSave={(v) => updateField("stopLoss", v)}
										value={trade.stopLoss}
									/>
								</div>
								<div>
									<span className="font-mono text-[10px] text-muted-foreground uppercase">
										Take Profit
									</span>
									<EditableNumber
										className={cn(
											"block font-semibold text-lg",
											trade.takeProfit ? "text-profit" : "",
										)}
										onSave={(v) => updateField("takeProfit", v)}
										value={trade.takeProfit}
									/>
								</div>
							</div>
							{trade.wasTrailed && (
								<div>
									<span className="font-mono text-[10px] text-muted-foreground uppercase">
										Trailed To
									</span>
									<EditableNumber
										className="block text-accent"
										onSave={(v) => updateField("trailedStopLoss", v)}
										value={trade.trailedStopLoss}
									/>
								</div>
							)}
						</div>
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-2 gap-3">
						<div className="rounded border border-white/5 bg-white/[0.02] p-3">
							<span className="font-mono text-[10px] text-muted-foreground uppercase">
								R:R Ratio
							</span>
							<p className="font-bold font-mono text-lg">
								{stats?.rrRatio ? `1:${stats.rrRatio.toFixed(1)}` : "—"}
							</p>
						</div>
						<div className="rounded border border-white/5 bg-white/[0.02] p-3">
							<span className="font-mono text-[10px] text-muted-foreground uppercase">
								Duration
							</span>
							<p className="font-bold font-mono text-lg">
								{stats?.duration ?? "—"}
							</p>
						</div>
						<div className="rounded border border-white/5 bg-white/[0.02] p-3">
							<span className="font-mono text-[10px] text-muted-foreground uppercase">
								Gross P&L
							</span>
							<p
								className={cn(
									"font-bold font-mono text-lg",
									trade.realizedPnl && parseFloat(trade.realizedPnl) >= 0
										? "text-profit"
										: "text-loss",
								)}
							>
								{trade.realizedPnl
									? formatCurrency(parseFloat(trade.realizedPnl))
									: "—"}
							</p>
						</div>
						<div className="rounded border border-white/5 bg-white/[0.02] p-3">
							<span className="font-mono text-[10px] text-muted-foreground uppercase">
								Account
							</span>
							<p className="truncate font-mono text-sm">
								{trade.account?.name ?? "—"}
							</p>
						</div>
					</div>

					{/* Tags */}
					<div className="rounded border border-white/5 bg-white/[0.02] p-4">
						<span className="mb-2 block font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Tags
						</span>
						<TradeTags
							maxDisplay={5}
							onUpdate={() => utils.trades.getById.invalidate({ id: tradeId })}
							tags={trade.tradeTags}
							tradeId={tradeId}
						/>
					</div>
				</div>

				{/* ============================================================
				    COLUMN 3: Context & Notes
				    ============================================================ */}
				<div className="space-y-4">
					{/* Setup & Emotion */}
					<div className="rounded border border-white/5 bg-white/[0.02] p-4">
						<span className="mb-3 block font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Trade Context
						</span>
						<div className="space-y-3">
							<div>
								<span className="font-mono text-[10px] text-muted-foreground uppercase">
									Setup Type
								</span>
								<Select
									onValueChange={(v) => updateField("setupType", v)}
									value={trade.setupType ?? ""}
								>
									<SelectTrigger className="mt-1 h-8 font-mono text-xs">
										<SelectValue placeholder="Select setup" />
									</SelectTrigger>
									<SelectContent>
										{SETUP_TYPES.map((s) => (
											<SelectItem key={s} value={s}>
												{s}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<span className="font-mono text-[10px] text-muted-foreground uppercase">
									Emotional State
								</span>
								<Select
									onValueChange={(v) => updateField("emotionalState", v)}
									value={trade.emotionalState ?? ""}
								>
									<SelectTrigger className="mt-1 h-8 font-mono text-xs">
										<SelectValue placeholder="Select state" />
									</SelectTrigger>
									<SelectContent>
										{EMOTIONAL_STATES.map((e) => (
											<SelectItem key={e.value} value={e.value}>
												<span className={e.color}>{e.label}</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Notes */}
					<div className="rounded border border-white/5 bg-white/[0.02] p-4">
						<div className="mb-2 flex items-center justify-between">
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Notes
							</span>
							<FileText className="h-3.5 w-3.5 text-muted-foreground" />
						</div>
						<EditableText
							className="min-h-[160px] whitespace-pre-wrap text-sm leading-relaxed"
							multiline
							onSave={(v) => updateField("notes", v)}
							placeholder="Click to add notes about this trade..."
							value={trade.notes}
						/>
					</div>

					{/* Screenshots Placeholder */}
					<div className="rounded border border-white/5 border-dashed bg-white/[0.01] p-4">
						<div className="flex items-center justify-center gap-2 text-muted-foreground">
							<Camera className="h-4 w-4" />
							<span className="font-mono text-xs">
								Screenshots (Coming Soon)
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* ================================================================
			    DIALOGS
			    ================================================================ */}

			{/* Close Trade Dialog */}
			<Dialog onOpenChange={setIsClosing} open={isClosing}>
				<DialogContent className="border-white/10 bg-background">
					<DialogHeader>
						<DialogTitle className="font-mono uppercase tracking-wider">
							Close Trade
						</DialogTitle>
						<DialogDescription className="font-mono text-xs">
							Enter exit details for {trade.symbol} {trade.direction}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<label
								className="font-mono text-[10px] text-muted-foreground uppercase"
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
							<div className="space-y-2">
								<label
									className="font-mono text-[10px] text-muted-foreground uppercase"
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
							<div className="space-y-2">
								<label
									className="font-mono text-[10px] text-muted-foreground uppercase"
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
						<div className="space-y-2">
							<label
								className="font-mono text-[10px] text-muted-foreground uppercase"
								htmlFor="close-fees"
							>
								Fees (Optional)
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
				<DialogContent className="border-white/10 bg-background">
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
