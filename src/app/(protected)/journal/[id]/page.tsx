"use client";

import {
	AlertTriangle,
	ArrowDownRight,
	ArrowLeft,
	BarChart3,
	Calendar,
	Camera,
	Check,
	Clock,
	DollarSign,
	Edit,
	FileText,
	Loader2,
	Percent,
	Plus,
	Save,
	Shield,
	Target,
	Trash2,
	TrendingDown,
	TrendingUp,
	X,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FOREX_SYMBOLS, FUTURES_SYMBOLS } from "@/lib/symbols";
import { cn, formatCurrency, getPnLColorClass } from "@/lib/utils";
import { api } from "@/trpc/react";

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
	{ value: "confident", label: "Confident" },
	{ value: "fearful", label: "Fearful" },
	{ value: "greedy", label: "Greedy" },
	{ value: "neutral", label: "Neutral" },
	{ value: "frustrated", label: "Frustrated" },
	{ value: "excited", label: "Excited" },
	{ value: "anxious", label: "Anxious" },
];

const EXIT_REASONS = [
	{ value: "manual", label: "Manual Exit" },
	{ value: "stop_loss", label: "Stop Loss Hit" },
	{ value: "trailing_stop", label: "Trailing Stop" },
	{ value: "take_profit", label: "Take Profit Hit" },
	{ value: "time_based", label: "Time-Based Exit" },
	{ value: "breakeven", label: "Breakeven Stop" },
];

// Executions Tab Component
function ExecutionsTab({
	tradeId,
	trade,
	onUpdate,
}: {
	tradeId: number;
	trade: {
		symbol: string;
		direction: string;
		entryPrice: string;
		quantity: string;
		exitReason?: string | null;
		trailedStopLoss?: string | null;
		wasTrailed?: boolean | null;
		remainingQuantity?: string | null;
	};
	onUpdate: () => void;
}) {
	const [isAddingExecution, setIsAddingExecution] = useState(false);
	const [isSettingTrailingStop, setIsSettingTrailingStop] = useState(false);
	const [isSettingExitReason, setIsSettingExitReason] = useState(false);

	const [executionForm, setExecutionForm] = useState({
		executionType: "scale_out" as "entry" | "exit" | "scale_in" | "scale_out",
		price: "",
		quantity: "",
		executedAt: new Date().toISOString().slice(0, 16),
		fees: "",
		notes: "",
	});

	const [trailedStopLoss, setTrailedStopLoss] = useState(trade.trailedStopLoss || "");
	const [exitReason, setExitReason] = useState(trade.exitReason || "");

	const { data: executions, isLoading, refetch: refetchExecutions } = api.trades.getExecutions.useQuery(
		{ tradeId },
	);

	const addExecution = api.trades.addExecution.useMutation({
		onSuccess: () => {
			toast.success("Execution added");
			setIsAddingExecution(false);
			setExecutionForm({
				executionType: "scale_out",
				price: "",
				quantity: "",
				executedAt: new Date().toISOString().slice(0, 16),
				fees: "",
				notes: "",
			});
			refetchExecutions();
			onUpdate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to add execution");
		},
	});

	const deleteExecution = api.trades.deleteExecution.useMutation({
		onSuccess: () => {
			toast.success("Execution deleted");
			refetchExecutions();
			onUpdate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete execution");
		},
	});

	const updateTrailingStop = api.trades.updateTrailingStop.useMutation({
		onSuccess: () => {
			toast.success("Trailing stop updated");
			setIsSettingTrailingStop(false);
			onUpdate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update trailing stop");
		},
	});

	const updateTrade = api.trades.update.useMutation({
		onSuccess: () => {
			toast.success("Exit reason updated");
			setIsSettingExitReason(false);
			onUpdate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update exit reason");
		},
	});

	const handleAddExecution = () => {
		addExecution.mutate({
			tradeId,
			executionType: executionForm.executionType,
			price: executionForm.price,
			quantity: executionForm.quantity,
			executedAt: new Date(executionForm.executedAt).toISOString(),
			fees: executionForm.fees || undefined,
			notes: executionForm.notes || undefined,
		});
	};

	const remainingQty = trade.remainingQuantity
		? parseFloat(trade.remainingQuantity)
		: parseFloat(trade.quantity);

	return (
		<div className="space-y-6">
			{/* Quick Actions */}
			<div className="flex flex-wrap gap-3">
				<Dialog open={isSettingTrailingStop} onOpenChange={setIsSettingTrailingStop}>
					<DialogTrigger asChild>
						<Button variant="outline" size="sm">
							<Target className="mr-2 h-4 w-4" />
							{trade.wasTrailed ? "Update Trailing Stop" : "Set Trailing Stop"}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Trailing Stop Loss</DialogTitle>
							<DialogDescription>
								Record the final trailed stop loss level for this trade.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label>Original Stop Loss</Label>
								<p className="font-mono text-sm text-muted-foreground">
									{trade.trailedStopLoss || "Not set"}
								</p>
							</div>
							<div className="space-y-2">
								<Label htmlFor="trailedSL">Trailed Stop Loss</Label>
								<Input
									id="trailedSL"
									type="number"
									step="any"
									className="font-mono"
									value={trailedStopLoss}
									onChange={(e) => setTrailedStopLoss(e.target.value)}
									placeholder="Enter trailed SL price"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsSettingTrailingStop(false)}>
								Cancel
							</Button>
							<Button
								disabled={!trailedStopLoss || updateTrailingStop.isPending}
								onClick={() => updateTrailingStop.mutate({ tradeId, trailedStopLoss })}
							>
								{updateTrailingStop.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Save
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog open={isSettingExitReason} onOpenChange={setIsSettingExitReason}>
					<DialogTrigger asChild>
						<Button variant="outline" size="sm">
							<Shield className="mr-2 h-4 w-4" />
							Set Exit Reason
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Exit Reason</DialogTitle>
							<DialogDescription>
								Record how this trade was closed.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label>Exit Reason</Label>
								<Select value={exitReason} onValueChange={setExitReason}>
									<SelectTrigger>
										<SelectValue placeholder="Select exit reason" />
									</SelectTrigger>
									<SelectContent>
										{EXIT_REASONS.map((reason) => (
											<SelectItem key={reason.value} value={reason.value}>
												{reason.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsSettingExitReason(false)}>
								Cancel
							</Button>
							<Button
								disabled={!exitReason || updateTrade.isPending}
								onClick={() => updateTrade.mutate({
									id: tradeId,
									exitReason: exitReason as "manual" | "stop_loss" | "trailing_stop" | "take_profit" | "time_based" | "breakeven",
								})}
							>
								{updateTrade.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Save
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog open={isAddingExecution} onOpenChange={setIsAddingExecution}>
					<DialogTrigger asChild>
						<Button size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Add Partial Exit
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Execution</DialogTitle>
							<DialogDescription>
								Record a partial exit, scale in, or scale out for this trade.
								Remaining: {remainingQty.toFixed(2)} contracts/lots
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label>Type</Label>
								<Select
									value={executionForm.executionType}
									onValueChange={(v) =>
										setExecutionForm({ ...executionForm, executionType: v as typeof executionForm.executionType })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="scale_out">Scale Out (Partial Exit)</SelectItem>
										<SelectItem value="scale_in">Scale In (Add to Position)</SelectItem>
										<SelectItem value="exit">Full Exit</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Price</Label>
									<Input
										type="number"
										step="any"
										className="font-mono"
										value={executionForm.price}
										onChange={(e) => setExecutionForm({ ...executionForm, price: e.target.value })}
										placeholder="0.00"
									/>
								</div>
								<div className="space-y-2">
									<Label>Quantity</Label>
									<Input
										type="number"
										step="any"
										className="font-mono"
										value={executionForm.quantity}
										onChange={(e) => setExecutionForm({ ...executionForm, quantity: e.target.value })}
										placeholder="0.00"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Date & Time</Label>
								<Input
									type="datetime-local"
									value={executionForm.executedAt}
									onChange={(e) => setExecutionForm({ ...executionForm, executedAt: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label>Fees (optional)</Label>
								<Input
									type="number"
									step="any"
									className="font-mono"
									value={executionForm.fees}
									onChange={(e) => setExecutionForm({ ...executionForm, fees: e.target.value })}
									placeholder="0.00"
								/>
							</div>
							<div className="space-y-2">
								<Label>Notes (optional)</Label>
								<Textarea
									value={executionForm.notes}
									onChange={(e) => setExecutionForm({ ...executionForm, notes: e.target.value })}
									placeholder="e.g., Took partial profit at resistance"
									rows={2}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsAddingExecution(false)}>
								Cancel
							</Button>
							<Button
								disabled={!executionForm.price || !executionForm.quantity || addExecution.isPending}
								onClick={handleAddExecution}
							>
								{addExecution.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Add Execution
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Executions List */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Execution History</CardTitle>
					<CardDescription>
						All entries and exits for this trade
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-3">
							{[...Array(3)].map((_, i) => (
								<Skeleton key={`exec-skeleton-${i}`} className="h-16" />
							))}
						</div>
					) : !executions || executions.length === 0 ? (
						<div className="py-8 text-center">
							<ArrowDownRight className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
							<p className="text-muted-foreground text-sm">No additional executions recorded</p>
							<p className="text-muted-foreground text-xs mt-1">
								Add partial exits or scale-ins to track complex trades
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{executions.map((exec) => {
								const pnl = exec.realizedPnl ? parseFloat(exec.realizedPnl) : null;
								const isExit = exec.executionType === "exit" || exec.executionType === "scale_out";

								return (
									<div
										key={exec.id}
										className="flex items-center justify-between rounded-lg border bg-white/[0.02] p-4"
									>
										<div className="flex items-center gap-4">
											<div
												className={cn(
													"rounded-md p-2",
													isExit ? "bg-loss/10" : "bg-profit/10",
												)}
											>
												{isExit ? (
													<ArrowDownRight className="h-4 w-4 text-loss" />
												) : (
													<TrendingUp className="h-4 w-4 text-profit" />
												)}
											</div>
											<div>
												<div className="flex items-center gap-2">
													<span className="font-medium capitalize">
														{exec.executionType.replace("_", " ")}
													</span>
													<Badge variant="outline" className="font-mono text-xs">
														{parseFloat(exec.quantity).toFixed(2)}
													</Badge>
												</div>
												<div className="flex items-center gap-2 text-muted-foreground text-xs">
													<span>@ {parseFloat(exec.price).toLocaleString()}</span>
													<span>•</span>
													<span>{new Date(exec.executedAt).toLocaleString()}</span>
												</div>
												{exec.notes && (
													<p className="mt-1 text-muted-foreground text-xs italic">
														{exec.notes}
													</p>
												)}
											</div>
										</div>
										<div className="flex items-center gap-3">
											{pnl !== null && (
												<span
													className={cn(
														"font-mono font-semibold",
														pnl >= 0 ? "text-profit" : "text-loss",
													)}
												>
													{pnl >= 0 ? "+" : ""}
													{formatCurrency(pnl)}
												</span>
											)}
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => {
													if (confirm("Delete this execution?")) {
														deleteExecution.mutate({ executionId: exec.id });
													}
												}}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default function TradeDetailPage() {
	const params = useParams();
	const router = useRouter();
	const tradeId = parseInt(params.id as string, 10);

	const [isEditing, setIsEditing] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Edit form state
	const [editForm, setEditForm] = useState({
		symbol: "",
		instrumentType: "futures" as "futures" | "forex",
		direction: "long" as "long" | "short",
		entryPrice: "",
		quantity: "",
		stopLoss: "",
		takeProfit: "",
		setupType: "",
		emotionalState: "",
		notes: "",
	});

	// Close trade form state
	const [closeData, setCloseData] = useState({
		exitPrice: "",
		exitDate: new Date().toISOString().split("T")[0],
		exitTime: new Date().toTimeString().slice(0, 5),
		fees: "",
	});

	const {
		data: trade,
		isLoading,
		refetch,
	} = api.trades.getById.useQuery(
		{ id: tradeId },
		{ enabled: !Number.isNaN(tradeId) },
	);

	// Initialize edit form when trade loads
	useEffect(() => {
		if (trade) {
			setEditForm({
				symbol: trade.symbol,
				instrumentType: trade.instrumentType,
				direction: trade.direction,
				entryPrice: trade.entryPrice,
				quantity: trade.quantity,
				stopLoss: trade.stopLoss || "",
				takeProfit: trade.takeProfit || "",
				setupType: trade.setupType || "",
				emotionalState: trade.emotionalState || "",
				notes: trade.notes || "",
			});
		}
	}, [trade]);

	const updateTrade = api.trades.update.useMutation({
		onSuccess: () => {
			toast.success("Trade updated");
			setIsEditing(false);
			refetch();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update trade");
		},
	});

	const closeTrade = api.trades.close.useMutation({
		onSuccess: () => {
			toast.success("Trade closed successfully");
			setIsClosing(false);
			refetch();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to close trade");
		},
	});

	const deleteTrade = api.trades.delete.useMutation({
		onSuccess: () => {
			toast.success("Trade deleted");
			router.push("/journal");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete trade");
		},
	});

	const handleSaveEdit = () => {
		updateTrade.mutate({
			id: tradeId,
			symbol: editForm.symbol || undefined,
			instrumentType: editForm.instrumentType,
			direction: editForm.direction,
			entryPrice: editForm.entryPrice || undefined,
			quantity: editForm.quantity || undefined,
			stopLoss: editForm.stopLoss || undefined,
			takeProfit: editForm.takeProfit || undefined,
			setupType: editForm.setupType || undefined,
			emotionalState:
				(editForm.emotionalState as
					| "confident"
					| "fearful"
					| "greedy"
					| "neutral"
					| "frustrated"
					| "excited"
					| "anxious") || undefined,
			notes: editForm.notes || undefined,
		});
	};

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

	const handleDeleteTrade = () => {
		deleteTrade.mutate({ id: tradeId });
	};

	// Calculate additional stats
	const calculateStats = () => {
		if (!trade) return null;

		const entry = parseFloat(trade.entryPrice);
		const exit = trade.exitPrice ? parseFloat(trade.exitPrice) : null;
		const sl = trade.stopLoss ? parseFloat(trade.stopLoss) : null;
		const tp = trade.takeProfit ? parseFloat(trade.takeProfit) : null;
		const isLong = trade.direction === "long";

		// Risk (distance to SL)
		const riskPips = sl ? Math.abs(entry - sl) : null;

		// Reward (distance to TP)
		const rewardPips = tp ? Math.abs(tp - entry) : null;

		// R:R Ratio
		const rrRatio = riskPips && rewardPips ? rewardPips / riskPips : null;

		// Actual R achieved (if closed)
		let rMultiple = null;
		if (exit && riskPips) {
			const pnlPips = isLong ? exit - entry : entry - exit;
			rMultiple = pnlPips / riskPips;
		}

		// Trade duration
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

		// Percentage gain/loss
		let percentChange = null;
		if (exit) {
			percentChange = ((exit - entry) / entry) * 100 * (isLong ? 1 : -1);
		}

		return {
			riskPips,
			rewardPips,
			rrRatio,
			rMultiple,
			duration,
			percentChange,
		};
	};

	const stats = calculateStats();

	if (isLoading) {
		return (
			<div className="mx-auto max-w-5xl space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-10" />
					<div className="space-y-2">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
				<Skeleton className="h-32" />
				<div className="grid gap-6 lg:grid-cols-3">
					<Skeleton className="h-48" />
					<Skeleton className="h-48" />
					<Skeleton className="h-48" />
				</div>
			</div>
		);
	}

	if (!trade) {
		return (
			<div className="flex flex-col items-center justify-center py-16">
				<AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
				<h2 className="font-semibold text-xl">Trade not found</h2>
				<p className="mb-4 text-muted-foreground">
					This trade doesn&apos;t exist or you don&apos;t have access to it.
				</p>
				<Button asChild>
					<Link href="/journal">Back to Journal</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Button asChild size="icon" variant="ghost">
						<Link href="/journal">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<div className="flex flex-wrap items-center gap-3">
							<h1 className="font-bold text-2xl tracking-tight">
								{trade.symbol}
							</h1>
							<Badge
								className={cn(
									"font-medium",
									trade.direction === "long"
										? "border-profit/50 bg-profit/10 text-profit"
										: "border-loss/50 bg-loss/10 text-loss",
								)}
								variant="outline"
							>
								{trade.direction === "long" ? (
									<TrendingUp className="mr-1 h-3 w-3" />
								) : (
									<TrendingDown className="mr-1 h-3 w-3" />
								)}
								{trade.direction.toUpperCase()}
							</Badge>
							<Badge
								className={trade.status === "closed" ? "bg-chart-1" : ""}
								variant={trade.status === "open" ? "secondary" : "default"}
							>
								{trade.status === "open" ? (
									<Clock className="mr-1 h-3 w-3" />
								) : (
									<Check className="mr-1 h-3 w-3" />
								)}
								{trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
							</Badge>
						</div>
						<p className="mt-1 text-muted-foreground text-sm">
							{trade.instrumentType.charAt(0).toUpperCase() +
								trade.instrumentType.slice(1)}
							{trade.setupType && ` • ${trade.setupType}`}
							{stats?.duration && ` • ${stats.duration}`}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{isEditing ? (
						<>
							<Button
								disabled={updateTrade.isPending}
								onClick={() => setIsEditing(false)}
								variant="outline"
							>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
							<Button disabled={updateTrade.isPending} onClick={handleSaveEdit}>
								{updateTrade.isPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Save className="mr-2 h-4 w-4" />
								)}
								Save
							</Button>
						</>
					) : (
						<>
							<Button onClick={() => setIsEditing(true)} variant="outline">
								<Edit className="mr-2 h-4 w-4" />
								Edit
							</Button>

							{trade.status === "open" && (
								<Dialog onOpenChange={setIsClosing} open={isClosing}>
									<DialogTrigger asChild>
										<Button>
											<XCircle className="mr-2 h-4 w-4" />
											Close Trade
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Close Trade</DialogTitle>
											<DialogDescription>
												Enter the exit details to close this {trade.symbol}{" "}
												{trade.direction} trade.
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="space-y-2">
												<Label htmlFor="exitPrice">Exit Price *</Label>
												<Input
													className="font-mono"
													id="exitPrice"
													onChange={(e) =>
														setCloseData({
															...closeData,
															exitPrice: e.target.value,
														})
													}
													placeholder="0.00"
													step="any"
													type="number"
													value={closeData.exitPrice}
												/>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="exitDate">Exit Date</Label>
													<Input
														id="exitDate"
														onChange={(e) =>
															setCloseData({
																...closeData,
																exitDate: e.target.value,
															})
														}
														type="date"
														value={closeData.exitDate}
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="exitTime">Exit Time</Label>
													<Input
														id="exitTime"
														onChange={(e) =>
															setCloseData({
																...closeData,
																exitTime: e.target.value,
															})
														}
														type="time"
														value={closeData.exitTime}
													/>
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="fees">Fees (optional)</Label>
												<Input
													className="font-mono"
													id="fees"
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
											<Button
												onClick={() => setIsClosing(false)}
												variant="outline"
											>
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
							)}

							<Dialog onOpenChange={setIsDeleting} open={isDeleting}>
								<DialogTrigger asChild>
									<Button size="icon" variant="outline">
										<Trash2 className="h-4 w-4" />
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Delete Trade</DialogTitle>
										<DialogDescription>
											Are you sure you want to delete this trade? This action
											cannot be undone.
										</DialogDescription>
									</DialogHeader>
									<DialogFooter>
										<Button
											onClick={() => setIsDeleting(false)}
											variant="outline"
										>
											Cancel
										</Button>
										<Button
											disabled={deleteTrade.isPending}
											onClick={handleDeleteTrade}
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
						</>
					)}
				</div>
			</div>

			{/* P&L Hero Card - Only for closed trades */}
			{trade.status === "closed" && trade.netPnl && (
				<Card
					className={cn(
						"overflow-hidden border-2",
						parseFloat(trade.netPnl) >= 0
							? "border-profit/30 bg-gradient-to-br from-profit/10 to-profit/5"
							: "border-loss/30 bg-gradient-to-br from-loss/10 to-loss/5",
					)}
				>
					<CardContent className="p-6">
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{/* Net P&L */}
							<div className="space-y-1">
								<p className="flex items-center gap-1 text-muted-foreground text-sm">
									<DollarSign className="h-3 w-3" />
									Net P&L
								</p>
								<p
									className={cn(
										"font-bold font-mono text-3xl",
										getPnLColorClass(trade.netPnl),
									)}
								>
									{formatCurrency(parseFloat(trade.netPnl))}
								</p>
							</div>

							{/* Percentage Change */}
							{stats?.percentChange != null && (
								<div className="space-y-1">
									<p className="flex items-center gap-1 text-muted-foreground text-sm">
										<Percent className="h-3 w-3" />
										Change
									</p>
									<p
										className={cn(
											"font-bold font-mono text-3xl",
											stats.percentChange >= 0 ? "text-profit" : "text-loss",
										)}
									>
										{stats.percentChange >= 0 ? "+" : ""}
										{stats.percentChange.toFixed(2)}%
									</p>
								</div>
							)}

							{/* R Multiple */}
							{stats?.rMultiple != null && (
								<div className="space-y-1">
									<p className="flex items-center gap-1 text-muted-foreground text-sm">
										<Target className="h-3 w-3" />R Multiple
									</p>
									<p
										className={cn(
											"font-bold font-mono text-3xl",
											stats.rMultiple >= 0 ? "text-profit" : "text-loss",
										)}
									>
										{stats.rMultiple >= 0 ? "+" : ""}
										{stats.rMultiple.toFixed(2)}R
									</p>
								</div>
							)}

							{/* Status Badges */}
							<div className="flex flex-col justify-center space-y-2">
								{/* Exit Reason Badge */}
								{trade.exitReason === "trailing_stop" && (
									<Badge className="w-fit border-accent/50 bg-accent/10 text-accent">
										<Target className="mr-1 h-3 w-3" />
										Trailing Stop
									</Badge>
								)}
								{trade.exitReason === "stop_loss" && (
									<Badge className="w-fit" variant="destructive">
										<AlertTriangle className="mr-1 h-3 w-3" />
										Stop Loss Hit
									</Badge>
								)}
								{trade.exitReason === "take_profit" && (
									<Badge className="w-fit bg-profit text-profit-foreground">
										<Target className="mr-1 h-3 w-3" />
										Take Profit Hit
									</Badge>
								)}
								{trade.exitReason === "breakeven" && (
									<Badge className="w-fit" variant="secondary">
										<Shield className="mr-1 h-3 w-3" />
										Breakeven
									</Badge>
								)}
								{trade.exitReason === "time_based" && (
									<Badge className="w-fit" variant="secondary">
										<Clock className="mr-1 h-3 w-3" />
										Time Exit
									</Badge>
								)}
								{/* Fallback to old logic if no exitReason set */}
								{!trade.exitReason && trade.stopLossHit && (
									<Badge className="w-fit" variant="destructive">
										<AlertTriangle className="mr-1 h-3 w-3" />
										Stop Loss Hit
									</Badge>
								)}
								{!trade.exitReason && trade.takeProfitHit && (
									<Badge className="w-fit bg-profit text-profit-foreground">
										<Target className="mr-1 h-3 w-3" />
										Take Profit Hit
									</Badge>
								)}
								{!trade.exitReason && !trade.stopLossHit && !trade.takeProfitHit && (
									<Badge className="w-fit" variant="secondary">
										Manual Exit
									</Badge>
								)}
								{/* Partial Exit Badge */}
								{trade.isPartiallyExited && (
									<Badge className="w-fit border-primary/50 bg-primary/10 text-primary">
										Partial Exits
									</Badge>
								)}
								{/* Trailed Badge */}
								{trade.wasTrailed && (
									<Badge className="w-fit border-accent/50 bg-accent/10 text-accent">
										Trailed
									</Badge>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Main Content Tabs */}
			<Tabs className="space-y-6" defaultValue="details">
				<TabsList>
					<TabsTrigger className="gap-2" value="details">
						<FileText className="h-4 w-4" />
						Details
					</TabsTrigger>
					<TabsTrigger className="gap-2" value="executions">
						<ArrowDownRight className="h-4 w-4" />
						Executions
					</TabsTrigger>
					<TabsTrigger className="gap-2" value="chart">
						<BarChart3 className="h-4 w-4" />
						Chart
					</TabsTrigger>
					<TabsTrigger className="gap-2" value="screenshots">
						<Camera className="h-4 w-4" />
						Screenshots
					</TabsTrigger>
				</TabsList>

				{/* Details Tab */}
				<TabsContent className="space-y-6" value="details">
					<div className="grid gap-6 lg:grid-cols-3">
						{/* Entry Details */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-base">
									<div
										className={cn(
											"rounded-md p-1.5",
											isEditing
												? editForm.direction === "long"
													? "bg-profit/10"
													: "bg-loss/10"
												: trade.direction === "long"
													? "bg-profit/10"
													: "bg-loss/10",
										)}
									>
										{(isEditing ? editForm.direction : trade.direction) ===
										"long" ? (
											<TrendingUp className="h-4 w-4 text-profit" />
										) : (
											<TrendingDown className="h-4 w-4 text-loss" />
										)}
									</div>
									Entry
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{isEditing ? (
									<>
										<div className="space-y-2">
											<Label className="text-xs">Instrument Type</Label>
											<Tabs
												onValueChange={(v) =>
													setEditForm({
														...editForm,
														instrumentType: v as "futures" | "forex",
														symbol: "", // Reset symbol when type changes
													})
												}
												value={editForm.instrumentType}
											>
												<TabsList className="grid h-9 w-full grid-cols-2">
													<TabsTrigger className="text-xs" value="futures">
														Futures
													</TabsTrigger>
													<TabsTrigger className="text-xs" value="forex">
														Forex
													</TabsTrigger>
												</TabsList>
											</Tabs>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">Symbol</Label>
											<Select
												onValueChange={(v) =>
													setEditForm({ ...editForm, symbol: v })
												}
												value={editForm.symbol}
											>
												<SelectTrigger className="h-9">
													<SelectValue placeholder="Select symbol" />
												</SelectTrigger>
												<SelectContent>
													{(editForm.instrumentType === "futures"
														? FUTURES_SYMBOLS
														: FOREX_SYMBOLS
													).map((s) => (
														<SelectItem key={s.value} value={s.value}>
															{s.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">Direction</Label>
											<Tabs
												onValueChange={(v) =>
													setEditForm({
														...editForm,
														direction: v as "long" | "short",
													})
												}
												value={editForm.direction}
											>
												<TabsList className="grid h-9 w-full grid-cols-2">
													<TabsTrigger
														className="text-xs data-[state=active]:bg-profit/20 data-[state=active]:text-profit"
														value="long"
													>
														Long
													</TabsTrigger>
													<TabsTrigger
														className="text-xs data-[state=active]:bg-loss/20 data-[state=active]:text-loss"
														value="short"
													>
														Short
													</TabsTrigger>
												</TabsList>
											</Tabs>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">Entry Price</Label>
											<Input
												className="h-9 font-mono"
												onChange={(e) =>
													setEditForm({
														...editForm,
														entryPrice: e.target.value,
													})
												}
												step="any"
												type="number"
												value={editForm.entryPrice}
											/>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">
												{editForm.instrumentType === "futures"
													? "Contracts"
													: "Lot Size"}
											</Label>
											<Input
												className="h-9 font-mono"
												onChange={(e) =>
													setEditForm({ ...editForm, quantity: e.target.value })
												}
												step="any"
												type="number"
												value={editForm.quantity}
											/>
										</div>
									</>
								) : (
									<>
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground text-sm">
												Price
											</span>
											<span className="font-mono font-semibold text-lg">
												{parseFloat(trade.entryPrice).toLocaleString(
													undefined,
													{
														minimumFractionDigits: 2,
														maximumFractionDigits: 5,
													},
												)}
											</span>
										</div>
										<Separator />
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground text-sm">
												Date
											</span>
											<span className="text-sm">
												{new Date(trade.entryTime).toLocaleDateString()}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground text-sm">
												Time
											</span>
											<span className="text-sm">
												{new Date(trade.entryTime).toLocaleTimeString()}
											</span>
										</div>
										<Separator />
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground text-sm">
												{trade.instrumentType === "futures"
													? "Contracts"
													: "Lots"}
											</span>
											<span className="font-medium font-mono">
												{parseFloat(trade.quantity).toFixed(2)}
											</span>
										</div>
									</>
								)}
							</CardContent>
						</Card>

						{/* Exit Details */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-base">
									<div className="rounded-md bg-loss/10 p-1.5">
										<ArrowDownRight className="h-4 w-4 text-loss" />
									</div>
									Exit
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-sm">Price</span>
									<span className="font-mono font-semibold text-lg">
										{trade.exitPrice
											? parseFloat(trade.exitPrice).toLocaleString(undefined, {
													minimumFractionDigits: 2,
													maximumFractionDigits: 5,
												})
											: "—"}
									</span>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-sm">Date</span>
									<span className="text-sm">
										{trade.exitTime
											? new Date(trade.exitTime).toLocaleDateString()
											: "—"}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-sm">Time</span>
									<span className="text-sm">
										{trade.exitTime
											? new Date(trade.exitTime).toLocaleTimeString()
											: "—"}
									</span>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-sm">Fees</span>
									<span className="font-mono text-sm">
										{trade.fees ? formatCurrency(parseFloat(trade.fees)) : "—"}
									</span>
								</div>
							</CardContent>
						</Card>

						{/* Risk Management */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-base">
									<div className="rounded-md bg-chart-3/10 p-1.5">
										<Shield className="h-4 w-4 text-chart-3" />
									</div>
									Risk
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{isEditing ? (
									<>
										<div className="space-y-2">
											<Label className="text-xs">Stop Loss</Label>
											<Input
												className="h-9 font-mono"
												onChange={(e) =>
													setEditForm({ ...editForm, stopLoss: e.target.value })
												}
												placeholder="Not set"
												step="any"
												type="number"
												value={editForm.stopLoss}
											/>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">Take Profit</Label>
											<Input
												className="h-9 font-mono"
												onChange={(e) =>
													setEditForm({
														...editForm,
														takeProfit: e.target.value,
													})
												}
												placeholder="Not set"
												step="any"
												type="number"
												value={editForm.takeProfit}
											/>
										</div>
									</>
								) : (
									<>
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground text-sm">
												Stop Loss
											</span>
											<span className="font-medium font-mono text-loss">
												{trade.stopLoss
													? parseFloat(trade.stopLoss).toLocaleString(
															undefined,
															{
																minimumFractionDigits: 2,
																maximumFractionDigits: 5,
															},
														)
													: "Not set"}
											</span>
										</div>
										{/* Trailed Stop Loss */}
										{trade.wasTrailed && trade.trailedStopLoss && (
											<>
												<div className="flex items-center justify-between">
													<span className="flex items-center gap-1 text-muted-foreground text-sm">
														<span className="text-accent">→</span> Trailed SL
													</span>
													<span className="font-medium font-mono text-accent">
														{parseFloat(trade.trailedStopLoss).toLocaleString(
															undefined,
															{
																minimumFractionDigits: 2,
																maximumFractionDigits: 5,
															},
														)}
													</span>
												</div>
											</>
										)}
										<Separator />
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground text-sm">
												Take Profit
											</span>
											<span className="font-medium font-mono text-profit">
												{trade.takeProfit
													? parseFloat(trade.takeProfit).toLocaleString(
															undefined,
															{
																minimumFractionDigits: 2,
																maximumFractionDigits: 5,
															},
														)
													: "Not set"}
											</span>
										</div>
										<Separator />
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground text-sm">
												R:R Ratio
											</span>
											<span className="font-medium font-mono">
												{stats?.rrRatio ? `1:${stats.rrRatio.toFixed(2)}` : "—"}
											</span>
										</div>
									</>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Trade Context */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base">
								<div className="rounded-md bg-chart-4/10 p-1.5">
									<Calendar className="h-4 w-4 text-chart-4" />
								</div>
								Trade Context
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								<div className="space-y-2">
									<Label className="text-muted-foreground text-xs uppercase tracking-wide">
										Setup Type
									</Label>
									{isEditing ? (
										<Select
											onValueChange={(v) =>
												setEditForm({ ...editForm, setupType: v })
											}
											value={editForm.setupType}
										>
											<SelectTrigger className="h-9">
												<SelectValue placeholder="Select setup" />
											</SelectTrigger>
											<SelectContent>
												{SETUP_TYPES.map((setup) => (
													<SelectItem key={setup} value={setup}>
														{setup}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									) : (
										<p className="font-medium">
											{trade.setupType || "Not specified"}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label className="text-muted-foreground text-xs uppercase tracking-wide">
										Emotional State
									</Label>
									{isEditing ? (
										<Select
											onValueChange={(v) =>
												setEditForm({ ...editForm, emotionalState: v })
											}
											value={editForm.emotionalState}
										>
											<SelectTrigger className="h-9">
												<SelectValue placeholder="Select state" />
											</SelectTrigger>
											<SelectContent>
												{EMOTIONAL_STATES.map((state) => (
													<SelectItem key={state.value} value={state.value}>
														{state.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									) : (
										<p className="font-medium capitalize">
											{trade.emotionalState || "Not specified"}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label className="text-muted-foreground text-xs uppercase tracking-wide">
										Source
									</Label>
									<Badge className="capitalize" variant="outline">
										{trade.importSource}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Notes */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base">
								<div className="rounded-md bg-chart-5/10 p-1.5">
									<FileText className="h-4 w-4 text-chart-5" />
								</div>
								Notes & Analysis
							</CardTitle>
							<CardDescription>
								Record your thoughts, lessons learned, and trade analysis
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isEditing ? (
								<Textarea
									onChange={(e) =>
										setEditForm({ ...editForm, notes: e.target.value })
									}
									placeholder="What was your reasoning? What patterns did you see? What would you do differently?"
									rows={6}
									value={editForm.notes}
								/>
							) : trade.notes ? (
								<p className="whitespace-pre-wrap text-sm leading-relaxed">
									{trade.notes}
								</p>
							) : (
								<p className="text-muted-foreground text-sm italic">
									No notes recorded. Click Edit to add your analysis.
								</p>
							)}
						</CardContent>
					</Card>

					{/* Tags */}
					{trade.tradeTags && trade.tradeTags.length > 0 && (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base">Tags</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{trade.tradeTags.map((tt) => (
										<Badge
											className="border"
											key={tt.tag.id}
											style={{
												backgroundColor: `${tt.tag.color}20`,
												borderColor: `${tt.tag.color}50`,
											}}
											variant="secondary"
										>
											{tt.tag.name}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Executions Tab */}
				<TabsContent className="space-y-6" value="executions">
					<ExecutionsTab tradeId={tradeId} trade={trade} onUpdate={refetch} />
				</TabsContent>

				{/* Chart Tab */}
				<TabsContent className="space-y-6" value="chart">
					<Card>
						<CardHeader>
							<CardTitle>Trade Visualization</CardTitle>
							<CardDescription>
								Price chart with entry, exit, and risk levels marked
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed bg-muted/50">
								<div className="space-y-2 text-center">
									<BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
									<p className="text-muted-foreground">
										TradingView Lightweight Charts integration coming soon
									</p>
									<p className="text-muted-foreground text-xs">
										Will display candlestick chart with entry (
										{trade.entryPrice}),
										{trade.exitPrice && ` exit (${trade.exitPrice}),`}
										{trade.stopLoss && ` SL (${trade.stopLoss}),`}
										{trade.takeProfit && ` TP (${trade.takeProfit})`}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Screenshots Tab */}
				<TabsContent className="space-y-6" value="screenshots">
					<Card>
						<CardHeader>
							<CardTitle>Trade Screenshots</CardTitle>
							<CardDescription>
								Visual documentation of your trade setup and execution
							</CardDescription>
						</CardHeader>
						<CardContent>
							{trade.screenshots && trade.screenshots.length > 0 ? (
								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{trade.screenshots.map((ss) => (
										<div
											className="aspect-video overflow-hidden rounded-lg border bg-muted"
											key={ss.id}
										>
											{/* biome-ignore lint/performance/noImgElement: External screenshot URLs */}
											<img
												alt={ss.caption || "Trade screenshot"}
												className="h-full w-full object-cover"
												src={ss.url}
											/>
										</div>
									))}
								</div>
							) : (
								<div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed bg-muted/50">
									<div className="space-y-2 text-center">
										<Camera className="mx-auto h-12 w-12 text-muted-foreground" />
										<p className="text-muted-foreground">
											No screenshots attached
										</p>
										<Button disabled size="sm" variant="outline">
											<Camera className="mr-2 h-4 w-4" />
											Upload Screenshot (Coming Soon)
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
