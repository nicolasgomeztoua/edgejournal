"use client";

import {
	Loader2,
	MoreHorizontal,
	Plus,
	RotateCcw,
	Search,
	Trash2,
	X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function JournalPage() {
	const { selectedAccountId, selectedAccount } = useAccount();
	const [tab, setTab] = useState<"trades" | "trash">("trades");

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
			limit: 30,
			status: statusFilter !== "all" ? statusFilter : undefined,
			tradeDirection:
				directionFilter !== "all"
					? (directionFilter as "long" | "short")
					: undefined,
			symbol: symbolFilter || undefined,
			search: debouncedSearch || undefined,
			accountId: selectedAccountId ?? undefined,
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
		onSuccess: (data) => {
			toast.success(`${data.deleted} trades moved to trash`);
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
		onSuccess: (data) => {
			toast.success(`${data.deleted} trades permanently deleted`);
			refetchDeleted();
			refetch();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to empty trash");
		},
	});

	const [emptyTrashDialogOpen, setEmptyTrashDialogOpen] = useState(false);

	const allTrades = data?.pages.flatMap((page) => page.items) ?? [];

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
	};

	const hasActiveFilters =
		statusFilter !== "all" ||
		directionFilter !== "all" ||
		symbolFilter ||
		search;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<span className="mb-2 block font-mono text-primary text-xs uppercase tracking-wider">
						Trading Journal
					</span>
					<h1 className="font-bold text-3xl tracking-tight">Trades</h1>
					<p className="mt-1 font-mono text-muted-foreground text-sm">
						{selectedAccount ? (
							<>
								Viewing{" "}
								<span className="text-foreground">{selectedAccount.name}</span>
							</>
						) : (
							"All accounts"
						)}
					</p>
				</div>
			</div>

			<Tabs onValueChange={(v) => setTab(v as "trades" | "trash")} value={tab}>
				<TabsList className="border border-white/5 bg-white/[0.02]">
					<TabsTrigger
						className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-white/10"
						value="trades"
					>
						All Trades
					</TabsTrigger>
					<TabsTrigger
						className="gap-2 font-mono text-xs uppercase tracking-wider data-[state=active]:bg-white/10"
						value="trash"
					>
						<Trash2 className="h-3.5 w-3.5" />
						Trash
						{deletedTrades && deletedTrades.length > 0 && (
							<Badge
								className="ml-1 h-4 px-1 font-mono text-[10px]"
								variant="secondary"
							>
								{deletedTrades.length}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent className="space-y-4" value="trades">
					{/* Filters */}
					<div className="flex flex-wrap items-center gap-3">
						{/* Search */}
						<div className="relative min-w-[200px] flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								className="pl-9 font-mono text-xs"
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
							<SelectTrigger className="w-[120px] font-mono text-xs">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem className="font-mono text-xs" value="all">
									All Status
								</SelectItem>
								<SelectItem className="font-mono text-xs" value="open">
									Open
								</SelectItem>
								<SelectItem className="font-mono text-xs" value="closed">
									Closed
								</SelectItem>
							</SelectContent>
						</Select>

						{/* Direction Filter */}
						<Select
							onValueChange={(value) =>
								setDirectionFilter(value as "all" | "long" | "short")
							}
							value={directionFilter}
						>
							<SelectTrigger className="w-[120px] font-mono text-xs">
								<SelectValue placeholder="Direction" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem className="font-mono text-xs" value="all">
									All
								</SelectItem>
								<SelectItem className="font-mono text-xs" value="long">
									Long
								</SelectItem>
								<SelectItem className="font-mono text-xs" value="short">
									Short
								</SelectItem>
							</SelectContent>
						</Select>

						{/* Symbol Filter */}
						<Input
							className="w-[100px] font-mono text-xs"
							onChange={(e) => setSymbolFilter(e.target.value.toUpperCase())}
							placeholder="Symbol"
							value={symbolFilter}
						/>

						{/* Clear Filters */}
						{hasActiveFilters && (
							<Button
								className="font-mono text-xs uppercase tracking-wider"
								onClick={clearFilters}
								size="sm"
								variant="ghost"
							>
								<X className="mr-1 h-3.5 w-3.5" />
								Clear
							</Button>
						)}
					</div>

					{/* Bulk Actions */}
					{selectedTrades.size > 0 && (
						<div className="flex items-center gap-3 rounded border border-white/10 bg-white/[0.02] px-4 py-3">
							<span className="font-mono text-muted-foreground text-xs">
								{selectedTrades.size} selected
							</span>
							<Button
								className="font-mono text-xs uppercase tracking-wider"
								disabled={deleteMany.isPending}
								onClick={handleBulkDelete}
								size="sm"
								variant="destructive"
							>
								<Trash2 className="mr-2 h-3.5 w-3.5" />
								Delete
							</Button>
							<Button
								className="font-mono text-xs uppercase tracking-wider"
								onClick={() => setSelectedTrades(new Set())}
								size="sm"
								variant="ghost"
							>
								Cancel
							</Button>
						</div>
					)}

					{/* Trades Table */}
					<div className="overflow-hidden rounded border border-white/5 bg-white/[0.01]">
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
								<div className="mb-4 flex h-16 w-16 items-center justify-center rounded border border-white/10 bg-white/[0.02]">
									<Plus className="h-6 w-6 text-muted-foreground/50" />
								</div>
								<h3 className="mb-1 font-medium">No trades found</h3>
								<p className="mb-4 font-mono text-muted-foreground text-xs">
									{hasActiveFilters
										? "Try adjusting your filters"
										: "Start logging your trades to build your journal"}
								</p>
								{!hasActiveFilters && (
									<Button
										asChild
										className="font-mono text-xs uppercase tracking-wider"
										size="sm"
									>
										<Link href="/trade/new">
											<Plus className="mr-2 h-3.5 w-3.5" />
											Add Your First Trade
										</Link>
									</Button>
								)}
							</div>
						) : (
							<>
								<Table>
									<TableHeader>
										<TableRow className="border-white/5 hover:bg-transparent">
											<TableHead className="w-[40px]">
												<Checkbox
													checked={
														selectedTrades.size === allTrades.length &&
														allTrades.length > 0
													}
													onCheckedChange={handleSelectAll}
												/>
											</TableHead>
											<TableHead className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
												Symbol
											</TableHead>
											<TableHead className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
												Side
											</TableHead>
											<TableHead className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
												Entry
											</TableHead>
											<TableHead className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
												Exit
											</TableHead>
											<TableHead className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
												Size
											</TableHead>
											<TableHead className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
												P&L
											</TableHead>
											<TableHead className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
												Result
											</TableHead>
											<TableHead className="w-[50px]" />
										</TableRow>
									</TableHeader>
									<TableBody>
										{allTrades.map((trade) => (
											<TableRow
												className={cn(
													"cursor-pointer border-white/5 transition-colors hover:bg-white/[0.02]",
													selectedTrades.has(trade.id) && "bg-white/[0.04]",
												)}
												key={trade.id}
											>
												<TableCell onClick={(e) => e.stopPropagation()}>
													<Checkbox
														checked={selectedTrades.has(trade.id)}
														onCheckedChange={(checked) =>
															handleSelectTrade(trade.id, !!checked)
														}
													/>
												</TableCell>
												<TableCell className="font-bold font-mono">
													<Link href={`/journal/${trade.id}`}>
														{trade.symbol}
													</Link>
												</TableCell>
												<TableCell>
													<Link href={`/journal/${trade.id}`}>
														<span
															className={cn(
																"font-mono text-xs uppercase",
																trade.direction === "long"
																	? "text-profit"
																	: "text-loss",
															)}
														>
															{trade.direction === "long" ? "Long" : "Short"}
														</span>
													</Link>
												</TableCell>
												<TableCell>
													<Link href={`/journal/${trade.id}`}>
														<div className="font-mono text-sm">
															{parseFloat(trade.entryPrice).toFixed(2)}
														</div>
														<div className="font-mono text-[10px] text-muted-foreground">
															{formatDateTime(trade.entryTime)}
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
																<div className="font-mono text-[10px] text-muted-foreground">
																	{formatDateTime(trade.exitTime)}
																</div>
															</>
														) : (
															<span className="font-mono text-muted-foreground text-xs">
																—
															</span>
														)}
													</Link>
												</TableCell>
												<TableCell className="font-mono text-sm">
													<Link href={`/journal/${trade.id}`}>
														{parseFloat(trade.quantity).toFixed(2)}
													</Link>
												</TableCell>
												<TableCell>
													<Link href={`/journal/${trade.id}`}>
														<span
															className={cn(
																"font-bold font-mono",
																trade.netPnl
																	? getPnLColorClass(trade.netPnl)
																	: "text-muted-foreground",
															)}
														>
															{trade.netPnl
																? formatCurrency(parseFloat(trade.netPnl))
																: "—"}
														</span>
													</Link>
												</TableCell>
												<TableCell>
													<Link href={`/journal/${trade.id}`}>
														{trade.status === "open" ? (
															<span className="font-mono text-muted-foreground text-xs">
																Open
															</span>
														) : trade.exitReason === "take_profit" ||
															trade.takeProfitHit ? (
															<span className="font-mono text-profit text-xs">
																TP
															</span>
														) : trade.exitReason === "stop_loss" ||
															trade.stopLossHit ? (
															<span className="font-mono text-loss text-xs">
																SL
															</span>
														) : trade.exitReason === "trailing_stop" ? (
															<span className="font-mono text-accent text-xs">
																Trail
															</span>
														) : trade.exitReason === "breakeven" ? (
															<span className="font-mono text-breakeven text-xs">
																BE
															</span>
														) : (
															<span className="font-mono text-muted-foreground text-xs">
																Manual
															</span>
														)}
													</Link>
												</TableCell>
												<TableCell onClick={(e) => e.stopPropagation()}>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																className="h-8 w-8"
																size="icon"
																variant="ghost"
															>
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem
																asChild
																className="font-mono text-xs"
															>
																<Link href={`/journal/${trade.id}`}>
																	View Details
																</Link>
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																className="font-mono text-destructive text-xs focus:text-destructive"
																onClick={() => {
																	setTradeToDelete(trade.id);
																	setDeleteDialogOpen(true);
																}}
															>
																<Trash2 className="mr-2 h-4 w-4" />
																Delete
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>

								{hasNextPage && (
									<div className="flex justify-center border-white/5 border-t p-4">
										<Button
											className="font-mono text-xs uppercase tracking-wider"
											disabled={isFetchingNextPage}
											onClick={() => fetchNextPage()}
											size="sm"
											variant="outline"
										>
											{isFetchingNextPage ? "Loading..." : "Load More"}
										</Button>
									</div>
								)}
							</>
						)}
					</div>
				</TabsContent>

				<TabsContent className="space-y-4" value="trash">
					<div className="flex items-center justify-between">
						<p className="font-mono text-muted-foreground text-xs">
							Trades in trash can be restored or permanently deleted.
						</p>
						{deletedTrades && deletedTrades.length > 0 && (
							<Button
								className="font-mono text-xs uppercase tracking-wider"
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
					<div className="overflow-hidden rounded border border-white/5 bg-white/[0.01]">
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
								<div className="mb-3 flex h-12 w-12 items-center justify-center rounded border border-white/10 bg-white/[0.02]">
									<Trash2 className="h-5 w-5 text-muted-foreground/30" />
								</div>
								<h3 className="mb-1 font-medium">Trash is empty</h3>
								<p className="font-mono text-muted-foreground text-xs">
									Deleted trades will appear here
								</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow className="border-white/5 hover:bg-transparent">
										<TableHead className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
											Symbol
										</TableHead>
										<TableHead className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
											Direction
										</TableHead>
										<TableHead className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
											Entry
										</TableHead>
										<TableHead className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
											P&L
										</TableHead>
										<TableHead className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
											Deleted
										</TableHead>
										<TableHead className="w-[100px] font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{deletedTrades.map((trade) => (
										<TableRow
											className="border-white/5 hover:bg-white/[0.02]"
											key={trade.id}
										>
											<TableCell className="font-bold font-mono">
												{trade.symbol}
											</TableCell>
											<TableCell>
												<span
													className={cn(
														"font-mono text-xs uppercase",
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
												<div className="font-mono text-[10px] text-muted-foreground">
													{formatDateTime(trade.entryTime)}
												</div>
											</TableCell>
											<TableCell>
												<span
													className={cn(
														"font-bold font-mono",
														trade.netPnl
															? getPnLColorClass(trade.netPnl)
															: "text-muted-foreground",
													)}
												>
													{trade.netPnl
														? formatCurrency(parseFloat(trade.netPnl))
														: "—"}
												</span>
											</TableCell>
											<TableCell className="font-mono text-muted-foreground text-xs">
												{trade.deletedAt
													? formatDateTime(trade.deletedAt)
													: "—"}
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
				<AlertDialogContent className="border-white/10 bg-background">
					<AlertDialogHeader>
						<AlertDialogTitle className="font-mono uppercase tracking-wider">
							Delete Trade
						</AlertDialogTitle>
						<AlertDialogDescription className="font-mono text-xs">
							This will move the trade to trash. You can restore it later if
							needed.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="font-mono text-xs uppercase tracking-wider">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive font-mono text-destructive-foreground text-xs uppercase tracking-wider hover:bg-destructive/90"
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
				<AlertDialogContent className="border-white/10 bg-background">
					<AlertDialogHeader>
						<AlertDialogTitle className="font-mono uppercase tracking-wider">
							Empty Trash
						</AlertDialogTitle>
						<AlertDialogDescription className="font-mono text-xs">
							This will permanently delete {deletedTrades?.length ?? 0}{" "}
							trade(s). This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="font-mono text-xs uppercase tracking-wider">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive font-mono text-destructive-foreground text-xs uppercase tracking-wider hover:bg-destructive/90"
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
