"use client";

import {
	ArrowDownRight,
	ArrowUpRight,
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
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
					<h1 className="font-bold text-3xl tracking-tight">Trades</h1>
					<p className="text-muted-foreground">
						{selectedAccount ? (
							<>
								Trades for{" "}
								<span className="font-medium">{selectedAccount.name}</span>
							</>
						) : (
							"View and manage all your trades"
						)}
					</p>
				</div>
			</div>

			<Tabs onValueChange={(v) => setTab(v as "trades" | "trash")} value={tab}>
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

				<TabsContent className="space-y-4" value="trades">
					{/* Filters */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex flex-wrap gap-3">
								{/* Search */}
								<div className="relative min-w-[200px] flex-1">
									<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
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
									<SelectTrigger className="w-[130px]">
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
									<SelectTrigger className="w-[130px]">
										<SelectValue placeholder="Direction" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Directions</SelectItem>
										<SelectItem value="long">Long</SelectItem>
										<SelectItem value="short">Short</SelectItem>
									</SelectContent>
								</Select>

								{/* Symbol Filter */}
								<Input
									className="w-[120px] font-mono"
									onChange={(e) =>
										setSymbolFilter(e.target.value.toUpperCase())
									}
									placeholder="Symbol..."
									value={symbolFilter}
								/>

								{/* Clear Filters */}
								{hasActiveFilters && (
									<Button onClick={clearFilters} size="icon" variant="ghost">
										<X className="h-4 w-4" />
									</Button>
								)}
							</div>

							{/* Bulk Actions */}
							{selectedTrades.size > 0 && (
								<div className="mt-4 flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
									<span className="text-muted-foreground text-sm">
										{selectedTrades.size} selected
									</span>
									<Button
										disabled={deleteMany.isPending}
										onClick={handleBulkDelete}
										size="sm"
										variant="destructive"
									>
										<Trash2 className="mr-2 h-4 w-4" />
										Delete Selected
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
						</CardContent>
					</Card>

					{/* Trades Table */}
					<Card>
						<CardContent className="p-0">
							{isLoading ? (
								<div className="space-y-4 p-6">
									{[...Array(5)].map((_, i) => (
										<div
											className="flex items-center gap-4"
											key={`skeleton-${i.toString()}`}
										>
											<Skeleton className="h-4 w-4" />
											<Skeleton className="h-10 flex-1" />
										</div>
									))}
								</div>
							) : allTrades.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<div className="mb-4 rounded-full bg-muted p-4">
										<Plus className="h-8 w-8 text-muted-foreground" />
									</div>
									<h3 className="mb-2 font-semibold">No trades found</h3>
									<p className="mb-4 text-muted-foreground text-sm">
										{hasActiveFilters
											? "Try adjusting your filters"
											: "Start logging your trades to build your journal"}
									</p>
									{!hasActiveFilters && (
										<Button asChild>
											<Link href="/trade/new">Add Your First Trade</Link>
										</Button>
									)}
								</div>
							) : (
								<>
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
												<TableHead>Direction</TableHead>
												<TableHead>Entry</TableHead>
												<TableHead>Exit</TableHead>
												<TableHead>Size</TableHead>
												<TableHead>P&L</TableHead>
												<TableHead>Status</TableHead>
												<TableHead className="w-[50px]"></TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{allTrades.map((trade) => (
												<TableRow
													className={cn(
														"cursor-pointer hover:bg-muted/50",
														selectedTrades.has(trade.id) && "bg-muted/30",
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
													<TableCell className="font-mono font-semibold">
														<Link href={`/journal/${trade.id}`}>
															{trade.symbol}
														</Link>
													</TableCell>
													<TableCell>
														<Link href={`/journal/${trade.id}`}>
															<Badge
																className={cn(
																	trade.direction === "long"
																		? "border-profit/50 text-profit"
																		: "border-loss/50 text-loss",
																)}
																variant="outline"
															>
																{trade.direction === "long" ? (
																	<ArrowUpRight className="mr-1 h-3 w-3" />
																) : (
																	<ArrowDownRight className="mr-1 h-3 w-3" />
																)}
																{trade.direction.toUpperCase()}
															</Badge>
														</Link>
													</TableCell>
													<TableCell>
														<Link href={`/journal/${trade.id}`}>
															<div className="font-mono text-sm">
																{parseFloat(trade.entryPrice).toFixed(2)}
															</div>
															<div className="text-muted-foreground text-xs">
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
																	<div className="text-muted-foreground text-xs">
																		{formatDateTime(trade.exitTime)}
																	</div>
																</>
															) : (
																<span className="text-muted-foreground">-</span>
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
																	trade.netPnl
																		? getPnLColorClass(trade.netPnl)
																		: "text-muted-foreground",
																)}
															>
																{trade.netPnl
																	? formatCurrency(parseFloat(trade.netPnl))
																	: "-"}
															</span>
														</Link>
													</TableCell>
													<TableCell>
														<Link href={`/journal/${trade.id}`}>
															<Badge
																variant={
																	trade.status === "open"
																		? "secondary"
																		: "default"
																}
															>
																{trade.status}
															</Badge>
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
																<DropdownMenuItem asChild>
																	<Link href={`/journal/${trade.id}`}>
																		View Details
																	</Link>
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	className="text-destructive focus:text-destructive"
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
										<div className="flex justify-center border-t p-4">
											<Button
												disabled={isFetchingNextPage}
												onClick={() => fetchNextPage()}
												variant="outline"
											>
												{isFetchingNextPage ? "Loading..." : "Load More"}
											</Button>
										</div>
									)}
								</>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent className="space-y-4" value="trash">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Deleted Trades</CardTitle>
							<CardDescription>
								Trades in trash can be restored or permanently deleted
							</CardDescription>
						</CardHeader>
						<CardContent className="p-0">
							{loadingDeleted ? (
								<div className="space-y-4 p-6">
									{[...Array(3)].map((_, i) => (
										<Skeleton
											className="h-12 w-full"
											key={`skeleton-${i.toString()}`}
										/>
									))}
								</div>
							) : !deletedTrades || deletedTrades.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<Trash2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
									<h3 className="mb-1 font-semibold">Trash is empty</h3>
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
													<Badge
														className={cn(
															trade.direction === "long"
																? "border-profit/50 text-profit"
																: "border-loss/50 text-loss",
														)}
														variant="outline"
													>
														{trade.direction.toUpperCase()}
													</Badge>
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
						</CardContent>
					</Card>
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
		</div>
	);
}
