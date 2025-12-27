"use client";

import { BookMarked, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { StrategyCard } from "@/components/strategy";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function StrategiesPage() {
	const router = useRouter();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [strategyToDelete, setStrategyToDelete] = useState<number | null>(null);

	const utils = api.useUtils();

	const { data: strategies, isLoading } = api.strategies.getAll.useQuery({
		includeInactive: true,
	});

	const deleteMutation = api.strategies.delete.useMutation({
		onSuccess: () => {
			toast.success("Strategy deleted");
			utils.strategies.getAll.invalidate();
			setDeleteDialogOpen(false);
			setStrategyToDelete(null);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete strategy");
		},
	});

	const duplicateMutation = api.strategies.duplicate.useMutation({
		onSuccess: (newStrategy) => {
			toast.success("Strategy duplicated");
			utils.strategies.getAll.invalidate();
			router.push(`/strategies/${newStrategy.id}`);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to duplicate strategy");
		},
	});

	const handleDelete = (id: number) => {
		setStrategyToDelete(id);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (strategyToDelete) {
			deleteMutation.mutate({ id: strategyToDelete });
		}
	};

	// Get stats for each strategy
	const strategyStats = api.useQueries((t) =>
		(strategies ?? []).map((s) => t.strategies.getStats({ id: s.id })),
	);

	const statsMap = new Map<
		number,
		{ winRate: number; totalPnl: number; avgPnl: number }
	>();
	strategies?.forEach((s, i) => {
		const stats = strategyStats[i]?.data;
		if (stats) {
			statsMap.set(s.id, {
				winRate: stats.winRate,
				totalPnl: stats.totalPnl,
				avgPnl: stats.avgPnl,
			});
		}
	});

	return (
		<div className="mx-auto w-[95%] max-w-none space-y-8 py-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Strategies</h1>
					<p className="mt-1 font-mono text-muted-foreground text-sm">
						Document your trading strategies with entry rules, risk management,
						and checklists.
					</p>
				</div>
				<Button asChild className="font-mono text-xs uppercase tracking-wider">
					<Link href="/strategies/new">
						<Plus className="mr-2 h-4 w-4" />
						New Strategy
					</Link>
				</Button>
			</div>

			{/* Loading state */}
			{isLoading && (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Skeleton className="h-48" key={i} />
					))}
				</div>
			)}

			{/* Empty state */}
			{!isLoading && (!strategies || strategies.length === 0) && (
				<div className="flex flex-col items-center justify-center rounded border border-white/5 bg-white/[0.02] py-16">
					<BookMarked className="mb-4 h-12 w-12 text-muted-foreground/50" />
					<h2 className="font-semibold text-lg">No strategies yet</h2>
					<p className="mt-1 max-w-sm text-center font-mono text-muted-foreground text-sm">
						Create your first strategy to document your trading approach and
						track rule compliance.
					</p>
					<Button
						asChild
						className="mt-6 font-mono text-xs uppercase tracking-wider"
					>
						<Link href="/strategies/new">
							<Plus className="mr-2 h-4 w-4" />
							Create Strategy
						</Link>
					</Button>
				</div>
			)}

			{/* Strategies grid */}
			{!isLoading && strategies && strategies.length > 0 && (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{strategies.map((strategy) => (
						<StrategyCard
							key={strategy.id}
							onDelete={() => handleDelete(strategy.id)}
							onDuplicate={() => duplicateMutation.mutate({ id: strategy.id })}
							onEdit={() => router.push(`/strategies/${strategy.id}`)}
							stats={statsMap.get(strategy.id) ?? null}
							strategy={strategy}
						/>
					))}
				</div>
			)}

			{/* Delete confirmation dialog */}
			<Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
				<DialogContent className="border-border bg-background">
					<DialogHeader>
						<DialogTitle className="font-mono uppercase tracking-wider">
							Delete Strategy
						</DialogTitle>
						<DialogDescription className="font-mono text-xs">
							Are you sure you want to delete this strategy? This will remove it
							from all associated trades.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => setDeleteDialogOpen(false)} variant="ghost">
							Cancel
						</Button>
						<Button
							disabled={deleteMutation.isPending}
							onClick={confirmDelete}
							variant="destructive"
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

