"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	AlertTriangle,
	ArrowDownRight,
	ArrowLeft,
	ArrowUpRight,
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
	Save,
	Shield,
	Target,
	TrendingDown,
	TrendingUp,
	Trash2,
	X,
	XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDateTime, getPnLColorClass, cn } from "@/lib/utils";
import { FUTURES_SYMBOLS, FOREX_SYMBOLS } from "@/lib/symbols";

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

export default function TradeDetailPage() {
	const params = useParams();
	const router = useRouter();
	const tradeId = parseInt(params.id as string);

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

	const { data: trade, isLoading, refetch } = api.trades.getById.useQuery(
		{ id: tradeId },
		{ enabled: !isNaN(tradeId) }
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
			emotionalState: (editForm.emotionalState as "confident" | "fearful" | "greedy" | "neutral" | "frustrated" | "excited" | "anxious") || undefined,
			notes: editForm.notes || undefined,
		});
	};

	const handleCloseTrade = () => {
		const exitTime = new Date(
			`${closeData.exitDate}T${closeData.exitTime}`
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
			const ms = new Date(trade.exitTime).getTime() - new Date(trade.entryTime).getTime();
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

		return { riskPips, rewardPips, rrRatio, rMultiple, duration, percentChange };
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
				<AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
				<h2 className="text-xl font-semibold">Trade not found</h2>
				<p className="text-muted-foreground mb-4">
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
					<Button variant="ghost" size="icon" asChild>
						<Link href="/journal">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<div className="flex items-center gap-3 flex-wrap">
							<h1 className="text-2xl font-bold tracking-tight">
								{trade.symbol}
							</h1>
							<Badge
								variant="outline"
								className={cn(
									"font-medium",
									trade.direction === "long"
										? "border-profit/50 bg-profit/10 text-profit"
										: "border-loss/50 bg-loss/10 text-loss"
								)}
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
								className={trade.status === "closed" ? "bg-chart-1" : ""}
							>
								{trade.status === "open" ? (
									<Clock className="mr-1 h-3 w-3" />
								) : (
									<Check className="mr-1 h-3 w-3" />
								)}
								{trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
							</Badge>
						</div>
						<p className="text-sm text-muted-foreground mt-1">
							{trade.instrumentType.charAt(0).toUpperCase() + trade.instrumentType.slice(1)}
							{trade.setupType && ` • ${trade.setupType}`}
							{stats?.duration && ` • ${stats.duration}`}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{isEditing ? (
						<>
							<Button
								variant="outline"
								onClick={() => setIsEditing(false)}
								disabled={updateTrade.isPending}
							>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
							<Button onClick={handleSaveEdit} disabled={updateTrade.isPending}>
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
							<Button variant="outline" onClick={() => setIsEditing(true)}>
								<Edit className="mr-2 h-4 w-4" />
								Edit
							</Button>

							{trade.status === "open" && (
								<Dialog open={isClosing} onOpenChange={setIsClosing}>
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
												Enter the exit details to close this {trade.symbol} {trade.direction} trade.
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="space-y-2">
												<Label htmlFor="exitPrice">Exit Price *</Label>
												<Input
													id="exitPrice"
													type="number"
													step="any"
													placeholder="0.00"
													className="font-mono"
													value={closeData.exitPrice}
													onChange={(e) =>
														setCloseData({ ...closeData, exitPrice: e.target.value })
													}
												/>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="exitDate">Exit Date</Label>
													<Input
														id="exitDate"
														type="date"
														value={closeData.exitDate}
														onChange={(e) =>
															setCloseData({ ...closeData, exitDate: e.target.value })
														}
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="exitTime">Exit Time</Label>
													<Input
														id="exitTime"
														type="time"
														value={closeData.exitTime}
														onChange={(e) =>
															setCloseData({ ...closeData, exitTime: e.target.value })
														}
													/>
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="fees">Fees (optional)</Label>
												<Input
													id="fees"
													type="number"
													step="any"
													placeholder="0.00"
													className="font-mono"
													value={closeData.fees}
													onChange={(e) =>
														setCloseData({ ...closeData, fees: e.target.value })
													}
												/>
											</div>
										</div>
										<DialogFooter>
											<Button variant="outline" onClick={() => setIsClosing(false)}>
												Cancel
											</Button>
											<Button
												onClick={handleCloseTrade}
												disabled={!closeData.exitPrice || closeTrade.isPending}
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

							<Dialog open={isDeleting} onOpenChange={setIsDeleting}>
								<DialogTrigger asChild>
									<Button variant="outline" size="icon">
										<Trash2 className="h-4 w-4" />
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Delete Trade</DialogTitle>
										<DialogDescription>
											Are you sure you want to delete this trade? This action cannot
											be undone.
										</DialogDescription>
									</DialogHeader>
									<DialogFooter>
										<Button variant="outline" onClick={() => setIsDeleting(false)}>
											Cancel
										</Button>
										<Button
											variant="destructive"
											onClick={handleDeleteTrade}
											disabled={deleteTrade.isPending}
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
						"border-2 overflow-hidden",
						parseFloat(trade.netPnl) >= 0
							? "border-profit/30 bg-gradient-to-br from-profit/10 to-profit/5"
							: "border-loss/30 bg-gradient-to-br from-loss/10 to-loss/5"
					)}
				>
					<CardContent className="p-6">
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{/* Net P&L */}
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground flex items-center gap-1">
									<DollarSign className="h-3 w-3" />
									Net P&L
								</p>
								<p
									className={cn(
										"text-3xl font-bold font-mono",
										getPnLColorClass(trade.netPnl)
									)}
								>
									{formatCurrency(parseFloat(trade.netPnl))}
								</p>
							</div>

							{/* Percentage Change */}
							{stats?.percentChange != null && (
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground flex items-center gap-1">
										<Percent className="h-3 w-3" />
										Change
									</p>
									<p
										className={cn(
											"text-3xl font-bold font-mono",
											stats.percentChange >= 0 ? "text-profit" : "text-loss"
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
									<p className="text-sm text-muted-foreground flex items-center gap-1">
										<Target className="h-3 w-3" />
										R Multiple
									</p>
									<p
										className={cn(
											"text-3xl font-bold font-mono",
											stats.rMultiple >= 0 ? "text-profit" : "text-loss"
										)}
									>
										{stats.rMultiple >= 0 ? "+" : ""}
										{stats.rMultiple.toFixed(2)}R
									</p>
								</div>
							)}

							{/* Status Badges */}
							<div className="space-y-2 flex flex-col justify-center">
								{trade.stopLossHit && (
									<Badge variant="destructive" className="w-fit">
										<AlertTriangle className="mr-1 h-3 w-3" />
										Stop Loss Hit
									</Badge>
								)}
								{trade.takeProfitHit && (
									<Badge className="bg-profit text-profit-foreground w-fit">
										<Target className="mr-1 h-3 w-3" />
										Take Profit Hit
									</Badge>
								)}
								{!trade.stopLossHit && !trade.takeProfitHit && (
									<Badge variant="secondary" className="w-fit">
										Manual Exit
									</Badge>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Main Content Tabs */}
			<Tabs defaultValue="details" className="space-y-6">
				<TabsList>
					<TabsTrigger value="details" className="gap-2">
						<FileText className="h-4 w-4" />
						Details
					</TabsTrigger>
					<TabsTrigger value="chart" className="gap-2">
						<BarChart3 className="h-4 w-4" />
						Chart
					</TabsTrigger>
					<TabsTrigger value="screenshots" className="gap-2">
						<Camera className="h-4 w-4" />
						Screenshots
					</TabsTrigger>
				</TabsList>

				{/* Details Tab */}
				<TabsContent value="details" className="space-y-6">
					<div className="grid gap-6 lg:grid-cols-3">
						{/* Entry Details */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<div className={cn(
										"p-1.5 rounded-md",
										isEditing 
											? editForm.direction === "long" ? "bg-profit/10" : "bg-loss/10"
											: trade.direction === "long" ? "bg-profit/10" : "bg-loss/10"
									)}>
										{(isEditing ? editForm.direction : trade.direction) === "long" ? (
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
												value={editForm.instrumentType}
												onValueChange={(v) =>
													setEditForm({ 
														...editForm, 
														instrumentType: v as "futures" | "forex",
														symbol: "" // Reset symbol when type changes
													})
												}
											>
												<TabsList className="grid w-full grid-cols-2 h-9">
													<TabsTrigger value="futures" className="text-xs">
														Futures
													</TabsTrigger>
													<TabsTrigger value="forex" className="text-xs">
														Forex
													</TabsTrigger>
												</TabsList>
											</Tabs>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">Symbol</Label>
											<Select
												value={editForm.symbol}
												onValueChange={(v) =>
													setEditForm({ ...editForm, symbol: v })
												}
											>
												<SelectTrigger className="h-9">
													<SelectValue placeholder="Select symbol" />
												</SelectTrigger>
												<SelectContent>
													{(editForm.instrumentType === "futures" ? FUTURES_SYMBOLS : FOREX_SYMBOLS).map((s) => (
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
												value={editForm.direction}
												onValueChange={(v) =>
													setEditForm({ ...editForm, direction: v as "long" | "short" })
												}
											>
												<TabsList className="grid w-full grid-cols-2 h-9">
													<TabsTrigger
														value="long"
														className="text-xs data-[state=active]:bg-profit/20 data-[state=active]:text-profit"
													>
														Long
													</TabsTrigger>
													<TabsTrigger
														value="short"
														className="text-xs data-[state=active]:bg-loss/20 data-[state=active]:text-loss"
													>
														Short
													</TabsTrigger>
												</TabsList>
											</Tabs>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">Entry Price</Label>
											<Input
												type="number"
												step="any"
												className="font-mono h-9"
												value={editForm.entryPrice}
												onChange={(e) =>
													setEditForm({ ...editForm, entryPrice: e.target.value })
												}
											/>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">
												{editForm.instrumentType === "futures" ? "Contracts" : "Lot Size"}
											</Label>
											<Input
												type="number"
												step="any"
												className="font-mono h-9"
												value={editForm.quantity}
												onChange={(e) =>
													setEditForm({ ...editForm, quantity: e.target.value })
												}
											/>
										</div>
									</>
								) : (
									<>
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">Price</span>
											<span className="font-mono font-semibold text-lg">
												{parseFloat(trade.entryPrice).toLocaleString(undefined, {
													minimumFractionDigits: 2,
													maximumFractionDigits: 5,
												})}
											</span>
										</div>
										<Separator />
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">Date</span>
											<span className="text-sm">
												{new Date(trade.entryTime).toLocaleDateString()}
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">Time</span>
											<span className="text-sm">
												{new Date(trade.entryTime).toLocaleTimeString()}
											</span>
										</div>
										<Separator />
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">
												{trade.instrumentType === "futures" ? "Contracts" : "Lots"}
											</span>
											<span className="font-mono font-medium">
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
								<CardTitle className="text-base flex items-center gap-2">
									<div className="p-1.5 rounded-md bg-loss/10">
										<ArrowDownRight className="h-4 w-4 text-loss" />
									</div>
									Exit
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Price</span>
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
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Date</span>
									<span className="text-sm">
										{trade.exitTime
											? new Date(trade.exitTime).toLocaleDateString()
											: "—"}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Time</span>
									<span className="text-sm">
										{trade.exitTime
											? new Date(trade.exitTime).toLocaleTimeString()
											: "—"}
									</span>
								</div>
								<Separator />
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Fees</span>
									<span className="font-mono text-sm">
										{trade.fees
											? formatCurrency(parseFloat(trade.fees))
											: "—"}
									</span>
								</div>
							</CardContent>
						</Card>

						{/* Risk Management */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base flex items-center gap-2">
									<div className="p-1.5 rounded-md bg-chart-3/10">
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
												type="number"
												step="any"
												placeholder="Not set"
												className="font-mono h-9"
												value={editForm.stopLoss}
												onChange={(e) =>
													setEditForm({ ...editForm, stopLoss: e.target.value })
												}
											/>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">Take Profit</Label>
											<Input
												type="number"
												step="any"
												placeholder="Not set"
												className="font-mono h-9"
												value={editForm.takeProfit}
												onChange={(e) =>
													setEditForm({ ...editForm, takeProfit: e.target.value })
												}
											/>
										</div>
									</>
								) : (
									<>
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">Stop Loss</span>
											<span className="font-mono font-medium text-loss">
												{trade.stopLoss
													? parseFloat(trade.stopLoss).toLocaleString(undefined, {
															minimumFractionDigits: 2,
															maximumFractionDigits: 5,
													  })
													: "Not set"}
											</span>
										</div>
										<Separator />
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">Take Profit</span>
											<span className="font-mono font-medium text-profit">
												{trade.takeProfit
													? parseFloat(trade.takeProfit).toLocaleString(undefined, {
															minimumFractionDigits: 2,
															maximumFractionDigits: 5,
													  })
													: "Not set"}
											</span>
										</div>
										<Separator />
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">R:R Ratio</span>
											<span className="font-mono font-medium">
												{stats?.rrRatio
													? `1:${stats.rrRatio.toFixed(2)}`
													: "—"}
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
							<CardTitle className="text-base flex items-center gap-2">
								<div className="p-1.5 rounded-md bg-chart-4/10">
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
											value={editForm.setupType}
											onValueChange={(v) =>
												setEditForm({ ...editForm, setupType: v })
											}
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
											value={editForm.emotionalState}
											onValueChange={(v) =>
												setEditForm({ ...editForm, emotionalState: v })
											}
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
									<Badge variant="outline" className="capitalize">
										{trade.importSource}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Notes */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base flex items-center gap-2">
								<div className="p-1.5 rounded-md bg-chart-5/10">
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
									placeholder="What was your reasoning? What patterns did you see? What would you do differently?"
									rows={6}
									value={editForm.notes}
									onChange={(e) =>
										setEditForm({ ...editForm, notes: e.target.value })
									}
								/>
							) : trade.notes ? (
								<p className="whitespace-pre-wrap text-sm leading-relaxed">
									{trade.notes}
								</p>
							) : (
								<p className="text-sm text-muted-foreground italic">
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
											key={tt.tag.id}
											variant="secondary"
											style={{
												backgroundColor: tt.tag.color + "20",
												borderColor: tt.tag.color + "50",
											}}
											className="border"
										>
											{tt.tag.name}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Chart Tab */}
				<TabsContent value="chart" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Trade Visualization</CardTitle>
							<CardDescription>
								Price chart with entry, exit, and risk levels marked
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[400px] flex items-center justify-center border border-dashed rounded-lg bg-muted/50">
								<div className="text-center space-y-2">
									<BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
									<p className="text-muted-foreground">
										TradingView Lightweight Charts integration coming soon
									</p>
									<p className="text-xs text-muted-foreground">
										Will display candlestick chart with entry ({trade.entryPrice}),
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
				<TabsContent value="screenshots" className="space-y-6">
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
											key={ss.id}
											className="aspect-video rounded-lg border bg-muted overflow-hidden"
										>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={ss.url}
												alt={ss.caption || "Trade screenshot"}
												className="w-full h-full object-cover"
											/>
										</div>
									))}
								</div>
							) : (
								<div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg bg-muted/50">
									<div className="text-center space-y-2">
										<Camera className="h-12 w-12 mx-auto text-muted-foreground" />
										<p className="text-muted-foreground">
											No screenshots attached
										</p>
										<Button variant="outline" size="sm" disabled>
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
