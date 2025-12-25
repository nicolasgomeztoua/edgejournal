"use client";

import {
	AlertTriangle,
	ArrowDownRight,
	ArrowLeft,
	BarChart3,
	Camera,
	Check,
	Clock,
	Edit,
	FileText,
	Loader2,
	Plus,
	Save,
	Shield,
	Target,
	Trash2,
	TrendingDown,
	TrendingUp,
	XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

	const [trailedStopLoss, setTrailedStopLoss] = useState(
		trade.trailedStopLoss || "",
	);
	const [exitReason, setExitReason] = useState(trade.exitReason || "");

	const {
		data: executions,
		isLoading,
		refetch: refetchExecutions,
	} = api.trades.getExecutions.useQuery({ tradeId });

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
			<div className="flex flex-wrap gap-2">
				<Dialog
					onOpenChange={setIsSettingTrailingStop}
					open={isSettingTrailingStop}
				>
					<DialogTrigger asChild>
						<Button size="sm" variant="outline">
							<Target className="mr-2 h-3.5 w-3.5" />
							{trade.wasTrailed ? "Update Trail" : "Set Trail"}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Trailing Stop Loss</DialogTitle>
							<DialogDescription>
								Record the final trailed stop loss level.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="trailedSL">Trailed Stop Loss</Label>
								<Input
									id="trailedSL"
									onChange={(e) => setTrailedStopLoss(e.target.value)}
									placeholder="Enter trailed SL price"
									step="any"
									type="number"
									value={trailedStopLoss}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={() => setIsSettingTrailingStop(false)}
								variant="outline"
							>
								Cancel
							</Button>
							<Button
								disabled={!trailedStopLoss || updateTrailingStop.isPending}
								onClick={() =>
									updateTrailingStop.mutate({ tradeId, trailedStopLoss })
								}
							>
								{updateTrailingStop.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Save
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog
					onOpenChange={setIsSettingExitReason}
					open={isSettingExitReason}
				>
					<DialogTrigger asChild>
						<Button size="sm" variant="outline">
							<Shield className="mr-2 h-3.5 w-3.5" />
							Exit Reason
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
							<Select onValueChange={setExitReason} value={exitReason}>
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
						<DialogFooter>
							<Button
								onClick={() => setIsSettingExitReason(false)}
								variant="outline"
							>
								Cancel
							</Button>
							<Button
								disabled={!exitReason || updateTrade.isPending}
								onClick={() =>
									updateTrade.mutate({
										id: tradeId,
										exitReason: exitReason as
											| "manual"
											| "stop_loss"
											| "trailing_stop"
											| "take_profit"
											| "time_based"
											| "breakeven",
									})
								}
							>
								{updateTrade.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Save
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog onOpenChange={setIsAddingExecution} open={isAddingExecution}>
					<DialogTrigger asChild>
						<Button size="sm">
							<Plus className="mr-2 h-3.5 w-3.5" />
							Add Execution
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Execution</DialogTitle>
							<DialogDescription>
								Remaining: {remainingQty.toFixed(2)} contracts/lots
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label>Type</Label>
								<Select
									onValueChange={(v) =>
										setExecutionForm({
											...executionForm,
											executionType: v as typeof executionForm.executionType,
										})
									}
									value={executionForm.executionType}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="scale_out">
											Scale Out (Partial Exit)
										</SelectItem>
										<SelectItem value="scale_in">
											Scale In (Add to Position)
										</SelectItem>
										<SelectItem value="exit">Full Exit</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Price</Label>
									<Input
										onChange={(e) =>
											setExecutionForm({
												...executionForm,
												price: e.target.value,
											})
										}
										placeholder="0.00"
										step="any"
										type="number"
										value={executionForm.price}
									/>
								</div>
								<div className="space-y-2">
									<Label>Quantity</Label>
									<Input
										onChange={(e) =>
											setExecutionForm({
												...executionForm,
												quantity: e.target.value,
											})
										}
										placeholder="0.00"
										step="any"
										type="number"
										value={executionForm.quantity}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Date & Time</Label>
								<Input
									onChange={(e) =>
										setExecutionForm({
											...executionForm,
											executedAt: e.target.value,
										})
									}
									type="datetime-local"
									value={executionForm.executedAt}
								/>
							</div>
							<div className="space-y-2">
								<Label>Notes (optional)</Label>
								<Textarea
									onChange={(e) =>
										setExecutionForm({
											...executionForm,
											notes: e.target.value,
										})
									}
									placeholder="e.g., Took partial profit at resistance"
									rows={2}
									value={executionForm.notes}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={() => setIsAddingExecution(false)}
								variant="outline"
							>
								Cancel
							</Button>
							<Button
								disabled={
									!executionForm.price ||
									!executionForm.quantity ||
									addExecution.isPending
								}
								onClick={handleAddExecution}
							>
								{addExecution.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Add
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Executions List */}
			{isLoading ? (
				<div className="space-y-3">
					{["exec-sk-1", "exec-sk-2", "exec-sk-3"].map((id) => (
						<Skeleton className="h-16" key={id} />
					))}
				</div>
			) : !executions || executions.length === 0 ? (
				<div className="rounded border border-white/10 border-dashed py-12 text-center">
					<p className="text-muted-foreground text-sm">
						No executions recorded
					</p>
					<p className="mt-1 text-muted-foreground text-xs">
						Add partial exits or scale-ins to track complex trades
					</p>
				</div>
			) : (
				<div className="space-y-2">
					{executions.map((exec) => {
						const pnl = exec.realizedPnl ? parseFloat(exec.realizedPnl) : null;
						const isExit =
							exec.executionType === "exit" ||
							exec.executionType === "scale_out";

						return (
							<div
								className="flex items-center justify-between rounded border border-white/5 bg-white/[0.01] px-4 py-3"
								key={exec.id}
							>
								<div className="flex items-center gap-3">
									<div
										className={cn(
											"flex h-8 w-8 items-center justify-center rounded",
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
										<div className="flex items-center gap-2 text-sm">
											<span className="capitalize">
												{exec.executionType.replace("_", " ")}
											</span>
											<span className="font-mono text-muted-foreground text-xs">
												{parseFloat(exec.quantity).toFixed(2)} @{" "}
												{parseFloat(exec.price).toLocaleString()}
											</span>
										</div>
										<div className="text-muted-foreground text-xs">
											{new Date(exec.executedAt).toLocaleString()}
										</div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									{pnl !== null && (
										<span
											className={cn(
												"font-mono text-sm",
												pnl >= 0 ? "text-profit" : "text-loss",
											)}
										>
											{pnl >= 0 ? "+" : ""}
											{formatCurrency(pnl)}
										</span>
									)}
									<Button
										className="h-7 w-7"
										onClick={() => {
											if (confirm("Delete this execution?")) {
												deleteExecution.mutate({ executionId: exec.id });
											}
										}}
										size="icon"
										variant="ghost"
									>
										<Trash2 className="h-3.5 w-3.5" />
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			)}
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
			toast.success("Trade closed");
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
	})();

	if (isLoading) {
		return (
			<div className="mx-auto max-w-4xl space-y-6">
				<Skeleton className="h-12 w-64" />
				<Skeleton className="h-32" />
				<Skeleton className="h-64" />
			</div>
		);
	}

	if (!trade) {
		return (
			<div className="flex flex-col items-center justify-center py-16">
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

	const formatPrice = (price: string) =>
		parseFloat(price).toLocaleString(undefined, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 5,
		});

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-4">
					<Button asChild size="icon" variant="ghost">
						<Link href="/journal">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<span className="mb-1 block font-mono text-xs uppercase tracking-wider text-primary">
							Trade Details
						</span>
						<div className="flex items-center gap-3">
							<h1 className="font-bold font-mono text-2xl">{trade.symbol}</h1>
							<Badge
								className={cn(
									"font-mono text-[10px] uppercase tracking-wider",
									trade.direction === "long"
										? "border-profit/30 bg-profit/10 text-profit"
										: "border-loss/30 bg-loss/10 text-loss",
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
								variant={trade.status === "open" ? "secondary" : "default"}
								className="font-mono text-[10px] uppercase tracking-wider"
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
							{trade.instrumentType}
							{trade.setupType && ` · ${trade.setupType}`}
							{stats?.duration && ` · ${stats.duration}`}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{isEditing ? (
						<>
							<Button
								onClick={() => setIsEditing(false)}
								size="sm"
								variant="ghost"
							>
								Cancel
							</Button>
							<Button
								disabled={updateTrade.isPending}
								onClick={handleSaveEdit}
								size="sm"
							>
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
							<Button
								onClick={() => setIsEditing(true)}
								size="sm"
								variant="outline"
								className="font-mono text-xs uppercase tracking-wider"
							>
								<Edit className="mr-2 h-3.5 w-3.5" />
								Edit
							</Button>

							{trade.status === "open" && (
								<Dialog onOpenChange={setIsClosing} open={isClosing}>
									<DialogTrigger asChild>
										<Button size="sm" className="font-mono text-xs uppercase tracking-wider">
											<XCircle className="mr-2 h-3.5 w-3.5" />
											Close
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Close Trade</DialogTitle>
											<DialogDescription>
												Enter exit details for this {trade.symbol}{" "}
												{trade.direction} position.
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="space-y-2">
												<Label>Exit Price</Label>
												<Input
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
													<Label>Exit Date</Label>
													<Input
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
													<Label>Exit Time</Label>
													<Input
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
												<Label>Fees (optional)</Label>
												<Input
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
									<Button size="icon" variant="ghost">
										<Trash2 className="h-4 w-4" />
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Delete Trade</DialogTitle>
										<DialogDescription>
											This will move the trade to trash. You can restore it
											later.
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
						</>
					)}
				</div>
			</div>

			{/* P&L Hero - Closed trades only */}
			{trade.status === "closed" && trade.netPnl && (
				<div
					className={cn(
						"relative overflow-hidden rounded-xl p-8",
						parseFloat(trade.netPnl) >= 0
							? "bg-gradient-to-br from-profit/10 via-profit/5 to-transparent"
							: "bg-gradient-to-br from-loss/10 via-loss/5 to-transparent",
					)}
				>
					{/* Decorative glow */}
					<div
						className={cn(
							"-top-20 -right-20 pointer-events-none absolute h-40 w-40 rounded-full blur-3xl",
							parseFloat(trade.netPnl) >= 0 ? "bg-profit/20" : "bg-loss/20",
						)}
					/>

					<div className="relative flex flex-wrap items-end justify-between gap-6">
						{/* Main P&L */}
						<div>
							<p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								Net Profit / Loss
							</p>
							<p
								className={cn(
									"font-bold font-mono text-5xl tracking-tight",
									getPnLColorClass(trade.netPnl),
								)}
							>
								{parseFloat(trade.netPnl) >= 0 ? "+" : ""}
								{formatCurrency(parseFloat(trade.netPnl))}
							</p>
							{/* Exit badges */}
							<div className="mt-3 flex flex-wrap gap-2">
								{trade.exitReason === "trailing_stop" && (
									<Badge
										className="border-accent/30 text-accent"
										variant="outline"
									>
										Trailing Stop
									</Badge>
								)}
								{trade.exitReason === "stop_loss" && (
									<Badge variant="destructive">Stop Loss</Badge>
								)}
								{trade.exitReason === "take_profit" && (
									<Badge className="bg-profit text-profit-foreground">
										Take Profit
									</Badge>
								)}
								{!trade.exitReason &&
									!trade.stopLossHit &&
									!trade.takeProfitHit && (
										<Badge variant="secondary">Manual Exit</Badge>
									)}
								{trade.wasTrailed && trade.exitReason !== "trailing_stop" && (
									<Badge
										className="border-accent/30 text-accent"
										variant="outline"
									>
										Trailed
									</Badge>
								)}
							</div>
						</div>

						{/* Secondary stats */}
						<div className="flex gap-8">
							{stats?.percentChange != null && (
								<div className="text-right">
									<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
										Change
									</p>
									<p
										className={cn(
											"font-bold font-mono text-2xl",
											stats.percentChange >= 0 ? "text-profit" : "text-loss",
										)}
									>
										{stats.percentChange >= 0 ? "+" : ""}
										{stats.percentChange.toFixed(2)}%
									</p>
								</div>
							)}
							{stats?.rMultiple != null && (
								<div className="text-right">
									<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
										R Multiple
									</p>
									<p
										className={cn(
											"font-bold font-mono text-2xl",
											stats.rMultiple >= 0 ? "text-profit" : "text-loss",
										)}
									>
										{stats.rMultiple >= 0 ? "+" : ""}
										{stats.rMultiple.toFixed(2)}R
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Main Content */}
			<Tabs className="space-y-6" defaultValue="details">
				<TabsList className="bg-white/[0.02] border border-white/5">
					<TabsTrigger className="gap-2 font-mono text-xs uppercase tracking-wider data-[state=active]:bg-white/10" value="details">
						<FileText className="h-3.5 w-3.5" />
						Details
					</TabsTrigger>
					<TabsTrigger className="gap-2 font-mono text-xs uppercase tracking-wider data-[state=active]:bg-white/10" value="executions">
						<ArrowDownRight className="h-3.5 w-3.5" />
						Executions
					</TabsTrigger>
					<TabsTrigger className="gap-2 font-mono text-xs uppercase tracking-wider data-[state=active]:bg-white/10" value="chart">
						<BarChart3 className="h-3.5 w-3.5" />
						Chart
					</TabsTrigger>
					<TabsTrigger className="gap-2 font-mono text-xs uppercase tracking-wider data-[state=active]:bg-white/10" value="screenshots">
						<Camera className="h-3.5 w-3.5" />
						Screenshots
					</TabsTrigger>
				</TabsList>

				<TabsContent className="space-y-6" value="details">
					{isEditing ? (
						/* Edit Mode */
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-4 rounded border border-white/5 p-6">
								<h3 className="font-medium">Position</h3>
								<div className="space-y-3">
									<div className="space-y-2">
										<Label className="text-muted-foreground text-xs">
											Instrument Type
										</Label>
										<div className="grid grid-cols-2 gap-2">
											<Button
												onClick={() =>
													setEditForm({
														...editForm,
														instrumentType: "futures",
														symbol: "",
													})
												}
												size="sm"
												type="button"
												variant={
													editForm.instrumentType === "futures"
														? "default"
														: "outline"
												}
											>
												Futures
											</Button>
											<Button
												onClick={() =>
													setEditForm({
														...editForm,
														instrumentType: "forex",
														symbol: "",
													})
												}
												size="sm"
												type="button"
												variant={
													editForm.instrumentType === "forex"
														? "default"
														: "outline"
												}
											>
												Forex
											</Button>
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-muted-foreground text-xs">
											Symbol
										</Label>
										<Select
											onValueChange={(v) =>
												setEditForm({ ...editForm, symbol: v })
											}
											value={editForm.symbol}
										>
											<SelectTrigger>
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
										<Label className="text-muted-foreground text-xs">
											Direction
										</Label>
										<div className="grid grid-cols-2 gap-2">
											<Button
												className={
													editForm.direction === "long"
														? "bg-profit text-profit-foreground hover:bg-profit/90"
														: ""
												}
												onClick={() =>
													setEditForm({ ...editForm, direction: "long" })
												}
												size="sm"
												type="button"
												variant={
													editForm.direction === "long" ? "default" : "outline"
												}
											>
												Long
											</Button>
											<Button
												className={
													editForm.direction === "short"
														? "bg-loss text-loss-foreground hover:bg-loss/90"
														: ""
												}
												onClick={() =>
													setEditForm({ ...editForm, direction: "short" })
												}
												size="sm"
												type="button"
												variant={
													editForm.direction === "short" ? "default" : "outline"
												}
											>
												Short
											</Button>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-2">
											<Label className="text-muted-foreground text-xs">
												Entry Price
											</Label>
											<Input
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
											<Label className="text-muted-foreground text-xs">
												Quantity
											</Label>
											<Input
												onChange={(e) =>
													setEditForm({
														...editForm,
														quantity: e.target.value,
													})
												}
												step="any"
												type="number"
												value={editForm.quantity}
											/>
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-4 rounded border border-white/5 p-6">
								<h3 className="font-medium">Risk Management</h3>
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-2">
										<Label className="text-muted-foreground text-xs">
											Stop Loss
										</Label>
										<Input
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
										<Label className="text-muted-foreground text-xs">
											Take Profit
										</Label>
										<Input
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
								</div>

								<h3 className="mt-6 font-medium">Context</h3>
								<div className="space-y-3">
									<div className="space-y-2">
										<Label className="text-muted-foreground text-xs">
											Setup Type
										</Label>
										<Select
											onValueChange={(v) =>
												setEditForm({ ...editForm, setupType: v })
											}
											value={editForm.setupType}
										>
											<SelectTrigger>
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
									</div>
									<div className="space-y-2">
										<Label className="text-muted-foreground text-xs">
											Emotional State
										</Label>
										<Select
											onValueChange={(v) =>
												setEditForm({ ...editForm, emotionalState: v })
											}
											value={editForm.emotionalState}
										>
											<SelectTrigger>
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
									</div>
								</div>
							</div>

							<div className="space-y-4 rounded border border-white/5 p-6 md:col-span-2">
								<h3 className="font-medium">Notes</h3>
								<Textarea
									onChange={(e) =>
										setEditForm({ ...editForm, notes: e.target.value })
									}
									placeholder="What was your reasoning? What patterns did you see?"
									rows={4}
									value={editForm.notes}
								/>
							</div>
						</div>
					) : (
						/* View Mode - Redesigned */
						<div className="space-y-8">
							{/* Entry & Exit - Side by Side Comparison */}
							<div className="grid gap-px overflow-hidden rounded-lg bg-white/10 md:grid-cols-2">
								{/* Entry Side */}
								<div className="bg-[#0a0a0a] p-6">
									<div className="mb-5 flex items-center gap-3">
										<div
											className={cn(
												"flex h-10 w-10 items-center justify-center rounded-full",
												trade.direction === "long"
													? "bg-profit/20 ring-2 ring-profit/30"
													: "bg-loss/20 ring-2 ring-loss/30",
											)}
										>
											{trade.direction === "long" ? (
												<TrendingUp className="h-5 w-5 text-profit" />
											) : (
												<TrendingDown className="h-5 w-5 text-loss" />
											)}
										</div>
										<div>
											<h3 className="font-semibold uppercase tracking-wide">
												Entry
											</h3>
											<p className="text-muted-foreground text-xs">
												{new Date(trade.entryTime).toLocaleDateString("en-US", {
													weekday: "short",
													month: "short",
													day: "numeric",
												})}
											</p>
										</div>
									</div>
									<div className="space-y-4">
										<div>
											<p className="text-muted-foreground text-xs uppercase tracking-wider">
												Price
											</p>
											<p className="font-bold font-mono text-2xl text-white">
												{formatPrice(trade.entryPrice)}
											</p>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-muted-foreground text-xs uppercase tracking-wider">
													Time
												</p>
												<p className="font-mono text-sm text-white/80">
													{new Date(trade.entryTime).toLocaleTimeString()}
												</p>
											</div>
											<div>
												<p className="text-muted-foreground text-xs uppercase tracking-wider">
													{trade.instrumentType === "futures"
														? "Contracts"
														: "Lots"}
												</p>
												<p className="font-mono text-sm text-white/80">
													{parseFloat(trade.quantity).toFixed(2)}
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Exit Side */}
								<div className="bg-[#0a0a0a] p-6">
									<div className="mb-5 flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/20">
											<Target className="h-5 w-5 text-white/70" />
										</div>
										<div>
											<h3 className="font-semibold uppercase tracking-wide">
												Exit
											</h3>
											<p className="text-muted-foreground text-xs">
												{trade.exitTime
													? new Date(trade.exitTime).toLocaleDateString(
															"en-US",
															{
																weekday: "short",
																month: "short",
																day: "numeric",
															},
														)
													: "Open Position"}
											</p>
										</div>
									</div>
									<div className="space-y-4">
										<div>
											<p className="text-muted-foreground text-xs uppercase tracking-wider">
												Price
											</p>
											<p className="font-bold font-mono text-2xl text-white">
												{trade.exitPrice ? formatPrice(trade.exitPrice) : "—"}
											</p>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-muted-foreground text-xs uppercase tracking-wider">
													Time
												</p>
												<p className="font-mono text-sm text-white/80">
													{trade.exitTime
														? new Date(trade.exitTime).toLocaleTimeString()
														: "—"}
												</p>
											</div>
											<div>
												<p className="text-muted-foreground text-xs uppercase tracking-wider">
													Fees
												</p>
												<p className="font-mono text-sm text-white/80">
													{trade.fees
														? formatCurrency(parseFloat(trade.fees))
														: "—"}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Risk Management */}
							<div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6">
								<div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl" />
								<div className="relative">
									<div className="mb-5 flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
											<Shield className="h-5 w-5 text-primary" />
										</div>
										<h3 className="font-semibold uppercase tracking-wide">
											Risk Management
										</h3>
									</div>
									<div className="grid gap-6 sm:grid-cols-4">
										<div>
											<p className="mb-1 text-muted-foreground text-xs uppercase tracking-wider">
												Stop Loss
											</p>
											<p
												className={cn(
													"font-mono font-semibold text-lg",
													trade.stopLoss
														? "text-loss"
														: "text-muted-foreground",
												)}
											>
												{trade.stopLoss
													? formatPrice(trade.stopLoss)
													: "Not set"}
											</p>
											{trade.wasTrailed && trade.trailedStopLoss && (
												<p className="mt-1 text-accent text-xs">
													→ Trailed to {formatPrice(trade.trailedStopLoss)}
												</p>
											)}
										</div>
										<div>
											<p className="mb-1 text-muted-foreground text-xs uppercase tracking-wider">
												Take Profit
											</p>
											<p
												className={cn(
													"font-mono font-semibold text-lg",
													trade.takeProfit
														? "text-profit"
														: "text-muted-foreground",
												)}
											>
												{trade.takeProfit
													? formatPrice(trade.takeProfit)
													: "Not set"}
											</p>
										</div>
										<div>
											<p className="mb-1 text-muted-foreground text-xs uppercase tracking-wider">
												R:R Ratio
											</p>
											<p className="font-mono font-semibold text-lg text-white">
												{stats?.rrRatio ? `1:${stats.rrRatio.toFixed(2)}` : "—"}
											</p>
										</div>
										<div>
											<p className="mb-1 text-muted-foreground text-xs uppercase tracking-wider">
												Risk ($)
											</p>
											<p className="font-mono font-semibold text-lg text-white">
												{trade.stopLoss && trade.entryPrice
													? formatCurrency(
															Math.abs(
																(parseFloat(trade.entryPrice) -
																	parseFloat(trade.stopLoss)) *
																	parseFloat(trade.quantity) *
																	(trade.instrumentType === "futures" ? 20 : 1),
															),
														)
													: "—"}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Context & Notes - Magazine Layout */}
							<div className="grid gap-6 lg:grid-cols-3">
								{/* Context Cards */}
								<div className="space-y-4 lg:col-span-1">
									<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
										Trade Context
									</h3>
									<div className="space-y-3">
										<div className="rounded-lg bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.06]">
											<p className="mb-1 text-muted-foreground text-xs">
												Setup Type
											</p>
											<p className="font-medium text-white">
												{trade.setupType || "Not specified"}
											</p>
										</div>
										<div className="rounded-lg bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.06]">
											<p className="mb-1 text-muted-foreground text-xs">
												Emotional State
											</p>
											<p className="font-medium text-white capitalize">
												{trade.emotionalState || "Not specified"}
											</p>
										</div>
										<div className="rounded-lg bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.06]">
											<p className="mb-1 text-muted-foreground text-xs">
												Import Source
											</p>
											<Badge className="mt-1 capitalize" variant="outline">
												{trade.importSource}
											</Badge>
										</div>
									</div>
								</div>

								{/* Notes */}
								<div className="lg:col-span-2">
									<h3 className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
										Notes & Analysis
									</h3>
									<div className="min-h-[200px] rounded-lg bg-white/[0.04] p-6">
										{trade.notes ? (
											<p className="whitespace-pre-wrap text-white/80 leading-relaxed">
												{trade.notes}
											</p>
										) : (
											<div className="flex h-full min-h-[150px] items-center justify-center text-center">
												<div>
													<FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
													<p className="text-muted-foreground text-sm">
														No notes recorded
													</p>
													<p className="mt-1 text-muted-foreground/60 text-xs">
														Click Edit to add your analysis
													</p>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</TabsContent>

				<TabsContent value="executions">
					<ExecutionsTab onUpdate={refetch} trade={trade} tradeId={tradeId} />
				</TabsContent>

				<TabsContent value="chart">
					<div className="flex h-[400px] items-center justify-center rounded border border-white/10 border-dashed">
						<div className="text-center">
							<BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
							<p className="text-muted-foreground text-sm">
								Chart integration coming soon
							</p>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="screenshots">
					{trade.screenshots && trade.screenshots.length > 0 ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{trade.screenshots.map((ss) => (
								<div
									className="aspect-video overflow-hidden rounded border border-white/10"
									key={ss.id}
								>
									<Image
										alt={ss.caption || "Trade screenshot"}
										className="h-full w-full object-cover"
										src={ss.url}
									/>
								</div>
							))}
						</div>
					) : (
						<div className="flex h-[200px] items-center justify-center rounded border border-white/10 border-dashed">
							<div className="text-center">
								<Camera className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
								<p className="text-muted-foreground text-sm">
									No screenshots attached
								</p>
								<Button className="mt-3" disabled size="sm" variant="outline">
									Upload Screenshot (Coming Soon)
								</Button>
							</div>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
