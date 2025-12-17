"use client";

import {
	ArrowDownRight,
	ArrowUpRight,
	ChevronDown,
	ChevronRight,
	Loader2,
	MoreHorizontal,
	Plus,
	RotateCcw,
	Search,
	Trash2,
	X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DateRangePicker,
	type DateRange,
	dateRangePresets,
} from "@/components/ui/date-range-picker";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from "@/contexts/account-context";
import {
	cn,
	formatCurrency,
	formatDateTime,
	getPnLColorClass,
} from "@/lib/utils";
import { api } from "@/trpc/react";

type Trade = {
	id: number;
	symbol: string;
	direction: "long" | "short";
	entryPrice: string;
	exitPrice: string | null;
	entryTime: Date;
	exitTime: Date | null;
	quantity: string;
	netPnl: string | null;
	status: "open" | "closed";
	exitReason: string | null;
	stopLossHit: boolean | null;
	takeProfitHit: boolean | null;
	setupType: string | null;
	deletedAt?: Date | null;
};

type TradesByDay = {
	date: string;
	trades: Trade[];
	pnl: number;
	wins: number;
	losses: number;
	breakevens: number;
};

function DayHeader({
	day,
	isExpanded,
	onToggle,
}: {
	day: TradesByDay;
	isExpanded: boolean;
	onToggle: () => void;
}) {
	const date = new Date(day.date);
	const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
	const dateStr = date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	return (
		<button
			className="flex w-full items-center justify-between border-white/5 border-b bg-white/[0.02] px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
			onClick={onToggle}
			type="button"
		>
			<div className="flex items-center gap-3">
				{isExpanded ? (
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				) : (
					<ChevronRight className="h-4 w-4 text-muted-foreground" />
				)}
				<div>
					<div className="font-semibold">{dayName}</div>
					<div className="text-muted-foreground text-sm">{dateStr}</div>
				</div>
			</div>
			<div className="flex items-center gap-6">
				<div className="text-right">
					<div className="text-muted-foreground text-xs">Trades</div>
					<div className="font-mono">{day.trades.length}</div>
				</div>
				<div className="text-right">
					<div className="text-muted-foreground text-xs">W/L/BE</div>
					<div className="flex gap-1 font-mono text-sm">
						<span className="text-profit">{day.wins}</span>
						<span className="text-muted-foreground">/</span>
						<span className="text-loss">{day.losses}</span>
						<span className="text-muted-foreground">/</span>
						<span className="text-yellow-500">{day.breakevens}</span>
					</div>
				</div>
				<div className="w-24 text-right">
					<div className="text-muted-foreground text-xs">P&L</div>
					<div
						className={cn(
							"font-mono font-semibold",
							getPnLColorClass(day.pnl),
						)}
					>
						{day.pnl >= 0 ? "+" : ""}
						{formatCurrency(day.pnl)}
					</div>
				</div>
			</div>
		</button>
	);
}

function TradeRow({
	trade,
	isSelected,
	onSelect,
	onDelete,
}: {
	trade: Trade;
	isSelected: boolean;
	onSelect: (checked: boolean) => void;
	onDelete: () => void;
}) {
	const pnl = trade.netPnl ? parseFloat(trade.netPnl) : 0;

	return (
		<TableRow
			className={cn(
				"cursor-pointer hover:bg-muted/50",
				isSelected && "bg-muted/30",
			)}
		>
			<TableCell className="w-[40px]" onClick={(e) => e.stopPropagation()}>
				<Checkbox checked={isSelected} onCheckedChange={onSelect} />
			</TableCell>
			<TableCell>
				<Link
					className="flex items-center gap-2"
					href={`/journal/${trade.id}`}
				>
					<div
						className={cn(
							"flex h-7 w-7 items-center justify-center rounded",
							trade.direction === "long" ? "bg-profit/10" : "bg-loss/10",
						)}
					>
						{trade.direction === "long" ? (
							<ArrowUpRight className="h-3.5 w-3.5 text-profit" />
						) : (
							<ArrowDownRight className="h-3.5 w-3.5 text-loss" />
						)}
					</div>
					<span className="font-mono font-semibold">{trade.symbol}</span>
				</Link>
			</TableCell>
			<TableCell>
				<Link href={`/journal/${trade.id}`}>
					<span
						className={cn(
							"font-medium text-sm",
							trade.direction === "long" ? "text-profit" : "text-loss",
						)}
					>
						{trade.direction === "long" ? "LONG" : "SHORT"}
					</span>
				</Link>
			</TableCell>
			<TableCell>
				<Link href={`/journal/${trade.id}`}>
					<div className="font-mono text-sm">
						{parseFloat(trade.entryPrice).toFixed(2)}
					</div>
					<div className="text-muted-foreground text-xs">
						{new Date(trade.entryTime).toLocaleTimeString("en-US", {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</div>
				</Link>
			</TableCell>
			<TableCell>
				<Link href={`/journal/${trade.id}`}>
					{trade.exitPrice ? (
						<>
							<div className="font-mono text-sm">
								{parseFloat(trade.exitPrice).toFixed(2)}
							</div>
							<div className="text-muted-foreground text-xs">
								{trade.exitTime
									? new Date(trade.exitTime).toLocaleTimeString("en-US", {
											hour: "2-digit",
											minute: "2-digit",
										})
									: ""}
							</div>
						</>
					) : (
						<Badge className="text-xs" variant="outline">
							Open
						</Badge>
					)}
				</Link>
			</TableCell>
			<TableCell className="font-mono">
				<Link href={`/journal/${trade.id}`}>
					{parseFloat(trade.quantity).toFixed(2)}
				</Link>
			</TableCell>
			<TableCell>
				<Link href={`/journal/${trade.id}`}>
					<span
						className={cn(
							"font-mono font-semibold",
							trade.netPnl ? getPnLColorClass(pnl) : "text-muted-foreground",
						)}
					>
						{trade.netPnl ? (pnl >= 0 ? "+" : "") + formatCurrency(pnl) : "-"}
					</span>
				</Link>
			</TableCell>
			<TableCell>
				<Link href={`/journal/${trade.id}`}>
					{trade.setupType ? (
						<Badge className="text-xs" variant="secondary">
							{trade.setupType
								.replace(/_/g, " ")
								.replace(/\b\w/g, (c) => c.toUpperCase())
								.slice(0, 15)}
						</Badge>
					) : (
						<span className="text-muted-foreground text-xs">-</span>
					)}
				</Link>
			</TableCell>
			<TableCell>
				<Link href={`/journal/${trade.id}`}>
					{trade.status === "open" ? (
						<span className="text-muted-foreground text-sm">Open</span>
					) : trade.exitReason === "take_profit" || trade.takeProfitHit ? (
						<span className="text-profit text-sm">TP</span>
					) : trade.exitReason === "stop_loss" || trade.stopLossHit ? (
						<span className="text-loss text-sm">SL</span>
					) : trade.exitReason === "trailing_stop" ? (
						<span className="text-primary text-sm">Trail</span>
					) : trade.exitReason === "breakeven" ? (
						<span className="text-sm text-yellow-500">BE</span>
					) : (
						<span className="text-muted-foreground text-sm">Manual</span>
					)}
				</Link>
			</TableCell>
			<TableCell onClick={(e) => e.stopPropagation()}>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="h-8 w-8" size="icon" variant="ghost">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem asChild>
							<Link href={`/journal/${trade.id}`}>View Details</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-destructive focus:text-destructive"
							onClick={onDelete}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}

export default function JournalPage() {
	const { selectedAccountId, selectedAccount } = useAccount();
	const [tab, setTab] = useState<"trades" | "trash">("trades");
	const [viewMode, setViewMode] = useState<"grouped" | "list">("grouped");

	// Date range
	const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
		const preset = dateRangePresets.find((p) => p.key === "allTime");
		return preset?.getRange();
	});

	// Filters
	const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
		"all",
	);
	const [directionFilter, setDirectionFilter] = useState<
		"all" | "long" | "short"
	>("all");
	const [symbolFilter, setSymbolFilter] = useState("");
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	// Selection for bulk actions
	const [selectedTrades, setSelectedTrades] = useState<Set<number>>(new Set());
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [tradeToDelete, setTradeToDelete] = useState<number | null>(null);

	// Track expanded days
	const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, 300);
		return () => clearTimeout(timer);
	}, [search]);

	// Main trades query
	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
	} = api.trades.getAll.useInfiniteQuery(
		{
			limit: 100,
			status: statusFilter !== "all" ? statusFilter : undefined,
			tradeDirection:
				directionFilter !== "all"
					? (directionFilter as "long" | "short")
					: undefined,
			symbol: symbolFilter || undefined,
			search: debouncedSearch || undefined,
			accountId: selectedAccountId ?? undefined,
			startDate: dateRange?.from.toISOString(),
			endDate: dateRange?.to.toISOString(),
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			enabled: tab === "trades",
		},
	);

	// Deleted trades query
	const {
		data: deletedTrades,
		isLoading: loadingDeleted,
		refetch: refetchDeleted,
	} = api.trades.getDeleted.useQuery(
		{ accountId: selectedAccountId ?? undefined },
		{ enabled: tab === "trash" },
	);

	// Mutations
	const deleteTrade = api.trades.delete.useMutation({
		onSuccess: () => {
			toast.success("Trade moved to trash");
			refetch();
			setSelectedTrades(new Set());
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete trade");
		},
	});

	const deleteMany = api.trades.deleteMany.useMutation({
		onSuccess: (result) => {
			toast.success(`${result.deleted} trades moved to trash`);
			refetch();
			setSelectedTrades(new Set());
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete trades");
		},
	});

	const restoreTrade = api.trades.restore.useMutation({
		onSuccess: () => {
			toast.success("Trade restored");
			refetchDeleted();
			refetch();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to restore trade");
		},
	});

	const permanentDelete = api.trades.permanentDelete.useMutation({
		onSuccess: () => {
			toast.success("Trade permanently deleted");
			refetchDeleted();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete trade");
		},
	});

	const emptyTrash = api.trades.emptyTrash.useMutation({
		onSuccess: (result) => {
			toast.success(`${result.deleted} trades permanently deleted`);
			refetchDeleted();
			refetch();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to empty trash");
		},
	});

	const [emptyTrashDialogOpen, setEmptyTrashDialogOpen] = useState(false);

	const allTrades = data?.pages.flatMap((page) => page.items) ?? [];

	// Group trades by day
	const tradesByDay = useMemo(() => {
		const breakevenThreshold = 5; // Default threshold
		const grouped: Record<string, TradesByDay> = {};

		for (const trade of allTrades) {
			const date = new Date(trade.entryTime);
			const dateKey = date.toISOString().split("T")[0] as string;

			if (!grouped[dateKey]) {
				grouped[dateKey] = {
					date: dateKey,
					trades: [],
					pnl: 0,
					wins: 0,
					losses: 0,
					breakevens: 0,
				};
			}

			const dayGroup = grouped[dateKey];
			if (dayGroup) {
				dayGroup.trades.push(trade as Trade);
				const pnl = trade.netPnl ? parseFloat(trade.netPnl) : 0;
				dayGroup.pnl += pnl;

				if (trade.status === "closed" && trade.netPnl) {
					if (Math.abs(pnl) <= breakevenThreshold) {
						dayGroup.breakevens++;
					} else if (pnl > 0) {
						dayGroup.wins++;
					} else {
						dayGroup.losses++;
					}
				}
			}
		}

		// Sort by date descending
		return Object.values(grouped).sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);
	}, [allTrades]);

	// Auto-expand first day when data loads
	useEffect(() => {
		const firstDay = tradesByDay[0];
		if (tradesByDay.length > 0 && expandedDays.size === 0 && firstDay) {
			setExpandedDays(new Set([firstDay.date]));
		}
	}, [tradesByDay, expandedDays.size]);

	const toggleDay = (date: string) => {
		const newExpanded = new Set(expandedDays);
		if (newExpanded.has(date)) {
			newExpanded.delete(date);
		} else {
			newExpanded.add(date);
		}
		setExpandedDays(newExpanded);
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedTrades(new Set(allTrades.map((t) => t.id)));
		} else {
			setSelectedTrades(new Set());
		}
	};

	const handleSelectTrade = (id: number, checked: boolean) => {
		const newSelected = new Set(selectedTrades);
		if (checked) {
			newSelected.add(id);
		} else {
			newSelected.delete(id);
		}
		setSelectedTrades(newSelected);
	};

	const handleBulkDelete = () => {
		if (selectedTrades.size === 0) return;
		deleteMany.mutate({ ids: Array.from(selectedTrades) });
	};

	const handleDeleteTrade = () => {
		if (tradeToDelete) {
			deleteTrade.mutate({ id: tradeToDelete });
			setDeleteDialogOpen(false);
			setTradeToDelete(null);
		}
	};

	const clearFilters = () => {
		setStatusFilter("all");
		setDirectionFilter("all");
		setSymbolFilter("");
		setSearch("");
		setDateRange(dateRangePresets.find((p) => p.key === "allTime")?.getRange());
	};

	const hasActiveFilters =
		statusFilter !== "all" ||
		directionFilter !== "all" ||
		symbolFilter ||
		search;

	// Summary stats
	const summary = useMemo(() => {
		let totalPnl = 0;
		let wins = 0;
		let losses = 0;
		let breakevens = 0;
		const threshold = 5;

		for (const trade of allTrades) {
			if (trade.status === "closed" && trade.netPnl) {
				const pnl = parseFloat(trade.netPnl);
				totalPnl += pnl;
				if (Math.abs(pnl) <= threshold) {
					breakevens++;
				} else if (pnl > 0) {
					wins++;
				} else {
					losses++;
				}
			}
		}

		return { totalPnl, wins, losses, breakevens, total: allTrades.length };
	}, [allTrades]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Trades</h1>
					{selectedAccount && (
						<p className="text-muted-foreground text-sm">
							{selectedAccount.name}
							{selectedAccount.broker && ` · ${selectedAccount.broker}`}
						</p>
					)}
				</div>
				<DateRangePicker onChange={setDateRange} value={dateRange} />
			</div>

			{/* Summary Stats */}
			{allTrades.length > 0 && (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
					<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
						<div className="text-muted-foreground text-xs">Total Trades</div>
						<div className="font-mono font-semibold text-lg">
							{summary.total}
						</div>
					</div>
					<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
						<div className="text-muted-foreground text-xs">Total P&L</div>
						<div
							className={cn(
								"font-mono font-semibold text-lg",
								getPnLColorClass(summary.totalPnl),
							)}
						>
							{summary.totalPnl >= 0 ? "+" : ""}
							{formatCurrency(summary.totalPnl)}
						</div>
					</div>
					<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
						<div className="text-muted-foreground text-xs">Wins</div>
						<div className="font-mono font-semibold text-lg text-profit">
							{summary.wins}
						</div>
					</div>
					<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
						<div className="text-muted-foreground text-xs">Losses</div>
						<div className="font-mono font-semibold text-lg text-loss">
							{summary.losses}
						</div>
					</div>
					<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
						<div className="text-muted-foreground text-xs">Win Rate</div>
						<div
							className={cn(
								"font-mono font-semibold text-lg",
								summary.wins + summary.losses > 0
									? (summary.wins / (summary.wins + summary.losses)) * 100 >= 50
										? "text-profit"
										: "text-loss"
									: "",
							)}
						>
							{summary.wins + summary.losses > 0
								? (
										(summary.wins / (summary.wins + summary.losses)) *
										100
									).toFixed(1)
								: 0}
							%
						</div>
					</div>
				</div>
			)}

			<Tabs onValueChange={(v) => setTab(v as "trades" | "trash")} value={tab}>
				<div className="flex items-center justify-between">
					<TabsList>
						<TabsTrigger value="trades">All Trades</TabsTrigger>
						<TabsTrigger className="gap-2" value="trash">
							<Trash2 className="h-4 w-4" />
							Trash
							{deletedTrades && deletedTrades.length > 0 && (
								<Badge className="ml-1 h-5 px-1.5" variant="secondary">
									{deletedTrades.length}
								</Badge>
							)}
						</TabsTrigger>
					</TabsList>
					{tab === "trades" && (
						<div className="flex items-center gap-2">
							<Button
								onClick={() =>
									setViewMode(viewMode === "grouped" ? "list" : "grouped")
								}
								size="sm"
								variant="outline"
							>
								{viewMode === "grouped" ? "List View" : "Day View"}
							</Button>
						</div>
					)}
				</div>

				<TabsContent className="mt-4 space-y-4" value="trades">
					{/* Filters */}
					<div className="flex flex-wrap items-center gap-3">
						{/* Search */}
						<div className="relative min-w-[200px] flex-1">
							<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								className="pl-9"
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search symbol, setup, notes..."
								value={search}
							/>
						</div>

						{/* Status Filter */}
						<Select
							onValueChange={(value) =>
								setStatusFilter(value as "all" | "open" | "closed")
							}
							value={statusFilter}
						>
							<SelectTrigger className="w-[120px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="open">Open</SelectItem>
								<SelectItem value="closed">Closed</SelectItem>
							</SelectContent>
						</Select>

						{/* Direction Filter */}
						<Select
							onValueChange={(value) =>
								setDirectionFilter(value as "all" | "long" | "short")
							}
							value={directionFilter}
						>
							<SelectTrigger className="w-[120px]">
								<SelectValue placeholder="Direction" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="long">Long</SelectItem>
								<SelectItem value="short">Short</SelectItem>
							</SelectContent>
						</Select>

						{/* Symbol Filter */}
						<Input
							className="w-[100px]"
							onChange={(e) => setSymbolFilter(e.target.value.toUpperCase())}
							placeholder="Symbol"
							value={symbolFilter}
						/>

						{/* Clear Filters */}
						{hasActiveFilters && (
							<Button onClick={clearFilters} size="sm" variant="ghost">
								<X className="mr-1 h-3.5 w-3.5" />
								Clear
							</Button>
						)}
					</div>

					{/* Bulk Actions */}
					{selectedTrades.size > 0 && (
						<div className="flex items-center gap-3 rounded border border-white/10 bg-white/[0.02] px-4 py-3">
							<span className="text-muted-foreground text-sm">
								{selectedTrades.size} selected
							</span>
							<Button
								disabled={deleteMany.isPending}
								onClick={handleBulkDelete}
								size="sm"
								variant="destructive"
							>
								<Trash2 className="mr-2 h-3.5 w-3.5" />
								Delete
							</Button>
							<Button
								onClick={() => setSelectedTrades(new Set())}
								size="sm"
								variant="ghost"
							>
								Cancel
							</Button>
						</div>
					)}

					{/* Trades View */}
					<div className="overflow-hidden rounded border border-white/5">
						{isLoading ? (
							<div className="space-y-3 p-6">
								{[...Array(5)].map((_, i) => (
									<Skeleton
										className="h-12 w-full"
										key={`skeleton-${i.toString()}`}
									/>
								))}
							</div>
						) : allTrades.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 text-center">
								<Plus className="mb-4 h-10 w-10 text-muted-foreground/50" />
								<h3 className="mb-1 font-medium">No trades found</h3>
								<p className="mb-4 text-muted-foreground text-sm">
									{hasActiveFilters
										? "Try adjusting your filters"
										: "Start logging your trades to build your journal"}
								</p>
								{!hasActiveFilters && (
									<Button asChild size="sm">
										<Link href="/trade/new">Add Your First Trade</Link>
									</Button>
								)}
							</div>
						) : viewMode === "grouped" ? (
							/* Grouped by Day View */
							<div>
								{tradesByDay.map((day) => (
									<div key={day.date}>
										<DayHeader
											day={day}
											isExpanded={expandedDays.has(day.date)}
											onToggle={() => toggleDay(day.date)}
										/>
										{expandedDays.has(day.date) && (
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead className="w-[40px]">
															<Checkbox
																checked={day.trades.every((t) =>
																	selectedTrades.has(t.id),
																)}
																onCheckedChange={(checked) => {
																	const newSelected = new Set(selectedTrades);
																	for (const t of day.trades) {
																		if (checked) {
																			newSelected.add(t.id);
																		} else {
																			newSelected.delete(t.id);
																		}
																	}
																	setSelectedTrades(newSelected);
																}}
															/>
														</TableHead>
														<TableHead>Symbol</TableHead>
														<TableHead>Side</TableHead>
														<TableHead>Entry</TableHead>
														<TableHead>Exit</TableHead>
														<TableHead>Size</TableHead>
														<TableHead>P&L</TableHead>
														<TableHead>Setup</TableHead>
														<TableHead>Exit</TableHead>
														<TableHead className="w-[50px]" />
													</TableRow>
												</TableHeader>
												<TableBody>
													{day.trades.map((trade) => (
														<TradeRow
															isSelected={selectedTrades.has(trade.id)}
															key={trade.id}
															onDelete={() => {
																setTradeToDelete(trade.id);
																setDeleteDialogOpen(true);
															}}
															onSelect={(checked) =>
																handleSelectTrade(trade.id, checked)
															}
															trade={trade}
														/>
													))}
												</TableBody>
											</Table>
										)}
									</div>
								))}
							</div>
						) : (
							/* List View */
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[40px]">
											<Checkbox
												checked={
													selectedTrades.size === allTrades.length &&
													allTrades.length > 0
												}
												onCheckedChange={handleSelectAll}
											/>
										</TableHead>
										<TableHead>Symbol</TableHead>
										<TableHead>Side</TableHead>
										<TableHead>Entry</TableHead>
										<TableHead>Exit</TableHead>
										<TableHead>Size</TableHead>
										<TableHead>P&L</TableHead>
										<TableHead>Setup</TableHead>
										<TableHead>Exit</TableHead>
										<TableHead className="w-[50px]" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{allTrades.map((trade) => (
										<TradeRow
											isSelected={selectedTrades.has(trade.id)}
											key={trade.id}
											onDelete={() => {
												setTradeToDelete(trade.id);
												setDeleteDialogOpen(true);
											}}
											onSelect={(checked) =>
												handleSelectTrade(trade.id, checked)
											}
											trade={trade as Trade}
										/>
									))}
								</TableBody>
							</Table>
						)}

						{hasNextPage && (
							<div className="flex justify-center border-white/5 border-t p-4">
								<Button
									disabled={isFetchingNextPage}
									onClick={() => fetchNextPage()}
									size="sm"
									variant="outline"
								>
									{isFetchingNextPage ? "Loading..." : "Load More"}
								</Button>
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent className="mt-4 space-y-4" value="trash">
					<div className="flex items-center justify-between">
						<p className="text-muted-foreground text-sm">
							Trades in trash can be restored or permanently deleted.
						</p>
						{deletedTrades && deletedTrades.length > 0 && (
							<Button
								disabled={emptyTrash.isPending}
								onClick={() => setEmptyTrashDialogOpen(true)}
								size="sm"
								variant="destructive"
							>
								{emptyTrash.isPending ? (
									<>
										<Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
										Deleting...
									</>
								) : (
									<>
										<Trash2 className="mr-2 h-3.5 w-3.5" />
										Empty Trash
									</>
								)}
							</Button>
						)}
					</div>
					<div className="rounded border border-white/5">
						{loadingDeleted ? (
							<div className="space-y-3 p-6">
								{[...Array(3)].map((_, i) => (
									<Skeleton
										className="h-12 w-full"
										key={`skeleton-${i.toString()}`}
									/>
								))}
							</div>
						) : !deletedTrades || deletedTrades.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<Trash2 className="mb-3 h-10 w-10 text-muted-foreground/30" />
								<h3 className="mb-1 font-medium">Trash is empty</h3>
								<p className="text-muted-foreground text-sm">
									Deleted trades will appear here
								</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Symbol</TableHead>
										<TableHead>Direction</TableHead>
										<TableHead>Entry</TableHead>
										<TableHead>P&L</TableHead>
										<TableHead>Deleted</TableHead>
										<TableHead className="w-[100px]">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{deletedTrades.map((trade) => (
										<TableRow key={trade.id}>
											<TableCell className="font-mono font-semibold">
												{trade.symbol}
											</TableCell>
											<TableCell>
												<span
													className={cn(
														"font-medium text-sm",
														trade.direction === "long"
															? "text-profit"
															: "text-loss",
													)}
												>
													{trade.direction === "long" ? "Long" : "Short"}
												</span>
											</TableCell>
											<TableCell>
												<div className="font-mono text-sm">
													{parseFloat(trade.entryPrice).toFixed(2)}
												</div>
												<div className="text-muted-foreground text-xs">
													{formatDateTime(trade.entryTime)}
												</div>
											</TableCell>
											<TableCell>
												<span
													className={cn(
														"font-mono font-semibold",
														trade.netPnl
															? getPnLColorClass(trade.netPnl)
															: "text-muted-foreground",
													)}
												>
													{trade.netPnl
														? formatCurrency(parseFloat(trade.netPnl))
														: "-"}
												</span>
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{trade.deletedAt
													? formatDateTime(trade.deletedAt)
													: "-"}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<Button
														className="h-8 w-8"
														disabled={restoreTrade.isPending}
														onClick={() =>
															restoreTrade.mutate({ id: trade.id })
														}
														size="icon"
														title="Restore"
														variant="ghost"
													>
														<RotateCcw className="h-4 w-4" />
													</Button>
													<Button
														className="h-8 w-8 text-destructive hover:text-destructive"
														disabled={permanentDelete.isPending}
														onClick={() => {
															if (
																confirm(
																	"Permanently delete this trade? This cannot be undone.",
																)
															) {
																permanentDelete.mutate({ id: trade.id });
															}
														}}
														size="icon"
														title="Delete permanently"
														variant="ghost"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</div>
				</TabsContent>
			</Tabs>

			{/* Delete Confirmation Dialog */}
			<AlertDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Trade</AlertDialogTitle>
						<AlertDialogDescription>
							This will move the trade to trash. You can restore it later if
							needed.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={handleDeleteTrade}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Empty Trash Confirmation Dialog */}
			<AlertDialog
				onOpenChange={setEmptyTrashDialogOpen}
				open={emptyTrashDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Empty Trash</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete {deletedTrades?.length ?? 0}{" "}
							trade(s). This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => {
								emptyTrash.mutate({
									accountId: selectedAccountId ?? undefined,
								});
								setEmptyTrashDialogOpen(false);
							}}
						>
							Delete All
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
