"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ArrowDownRight,
	ArrowUpRight,
	Filter,
	Plus,
	Search,
	X,
} from "lucide-react";
import { formatCurrency, formatDateTime, getPnLColorClass, cn } from "@/lib/utils";
import { useAccount } from "@/contexts/account-context";

export default function JournalPage() {
	const { selectedAccountId, selectedAccount } = useAccount();
	const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
	const [symbolFilter, setSymbolFilter] = useState<string>("");
	const [search, setSearch] = useState("");

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		api.trades.getAll.useInfiniteQuery(
			{
				limit: 20,
				status: statusFilter === "all" ? undefined : statusFilter,
				symbol: symbolFilter || undefined,
				accountId: selectedAccountId ?? undefined,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			}
		);

	const allTrades = data?.pages.flatMap((page) => page.items) ?? [];
	const filteredTrades = search
		? allTrades.filter(
				(trade) =>
					trade.symbol.toLowerCase().includes(search.toLowerCase()) ||
					trade.setupType?.toLowerCase().includes(search.toLowerCase())
		  )
		: allTrades;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Trade Journal</h1>
					<p className="text-muted-foreground">
						{selectedAccount ? (
							<>Trades for <span className="font-medium">{selectedAccount.name}</span></>
						) : (
							"View and manage all your trades"
						)}
					</p>
				</div>
				<Button asChild>
					<Link href="/trade/new">
						<Plus className="mr-2 h-4 w-4" />
						New Trade
					</Link>
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4" />
						<CardTitle className="text-base">Filters</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-4">
						<div className="relative flex-1 min-w-[200px]">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search trades..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-9"
							/>
						</div>
						<Select
							value={statusFilter}
							onValueChange={(value) =>
								setStatusFilter(value as "all" | "open" | "closed")
							}
						>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Trades</SelectItem>
								<SelectItem value="open">Open</SelectItem>
								<SelectItem value="closed">Closed</SelectItem>
							</SelectContent>
						</Select>
						<Input
							placeholder="Symbol filter..."
							value={symbolFilter}
							onChange={(e) => setSymbolFilter(e.target.value.toUpperCase())}
							className="w-[150px] font-mono"
						/>
						{(statusFilter !== "all" || symbolFilter || search) && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => {
									setStatusFilter("all");
									setSymbolFilter("");
									setSearch("");
								}}
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Trades Table */}
			<Card>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="p-6 space-y-4">
							{[...Array(5)].map((_, i) => (
								<div key={i} className="flex items-center gap-4">
									<Skeleton className="h-10 w-10 rounded" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-24" />
									</div>
									<Skeleton className="h-4 w-20" />
								</div>
							))}
						</div>
					) : filteredTrades.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<div className="rounded-full bg-muted p-4 mb-4">
								<Plus className="h-8 w-8 text-muted-foreground" />
							</div>
							<h3 className="font-semibold mb-2">No trades found</h3>
							<p className="text-sm text-muted-foreground mb-4">
								{search || statusFilter !== "all" || symbolFilter
									? "Try adjusting your filters"
									: "Start logging your trades to build your journal"}
							</p>
							<Button asChild>
								<Link href="/trade/new">Add Your First Trade</Link>
							</Button>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Symbol</TableHead>
										<TableHead>Direction</TableHead>
										<TableHead>Entry</TableHead>
										<TableHead>Exit</TableHead>
										<TableHead>Size</TableHead>
										<TableHead>P&L</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Setup</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredTrades.map((trade) => (
										<TableRow
											key={trade.id}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => {
												window.location.href = `/journal/${trade.id}`;
											}}
										>
											<TableCell className="font-mono font-semibold">
												{trade.symbol}
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className={cn(
														trade.direction === "long"
															? "border-profit/50 text-profit"
															: "border-loss/50 text-loss"
													)}
												>
													{trade.direction === "long" ? (
														<ArrowUpRight className="mr-1 h-3 w-3" />
													) : (
														<ArrowDownRight className="mr-1 h-3 w-3" />
													)}
													{trade.direction.toUpperCase()}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="font-mono text-sm">
													{parseFloat(trade.entryPrice).toFixed(2)}
												</div>
												<div className="text-xs text-muted-foreground">
													{formatDateTime(trade.entryTime)}
												</div>
											</TableCell>
											<TableCell>
												{trade.exitPrice ? (
													<>
														<div className="font-mono text-sm">
															{parseFloat(trade.exitPrice).toFixed(2)}
														</div>
														<div className="text-xs text-muted-foreground">
															{formatDateTime(trade.exitTime)}
														</div>
													</>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</TableCell>
											<TableCell className="font-mono">
												{parseFloat(trade.quantity).toFixed(2)}
											</TableCell>
											<TableCell>
												<span
													className={cn(
														"font-mono font-semibold",
														trade.netPnl
															? getPnLColorClass(trade.netPnl)
															: "text-muted-foreground"
													)}
												>
													{trade.netPnl
														? formatCurrency(parseFloat(trade.netPnl))
														: "-"}
												</span>
											</TableCell>
											<TableCell>
												<Badge
													variant={
														trade.status === "open" ? "secondary" : "default"
													}
												>
													{trade.status}
												</Badge>
											</TableCell>
											<TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
												{trade.setupType || "-"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							{hasNextPage && (
								<div className="flex justify-center p-4 border-t">
									<Button
										variant="outline"
										onClick={() => fetchNextPage()}
										disabled={isFetchingNextPage}
									>
										{isFetchingNextPage ? "Loading..." : "Load More"}
									</Button>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

