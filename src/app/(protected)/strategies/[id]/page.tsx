"use client";

import { AlertTriangle, ArrowLeft, Copy, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { StrategyFormData } from "@/components/strategy";
import { StrategyForm } from "@/components/strategy";
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
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export default function StrategyDetailPage() {
	const params = useParams();
	const router = useRouter();
	const strategyId = parseInt(params.id as string, 10);

	const [isDeleting, setIsDeleting] = useState(false);

	const utils = api.useUtils();

	const { data: strategy, isLoading } = api.strategies.getById.useQuery(
		{ id: strategyId },
		{ enabled: !Number.isNaN(strategyId) },
	);

	const { data: stats } = api.strategies.getStats.useQuery(
		{ id: strategyId },
		{ enabled: !Number.isNaN(strategyId) && !!strategy },
	);

	const updateMutation = api.strategies.update.useMutation({
		onSuccess: () => {
			toast.success("Strategy updated");
			utils.strategies.getById.invalidate({ id: strategyId });
			utils.strategies.getAll.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update strategy");
		},
	});

	const deleteMutation = api.strategies.delete.useMutation({
		onSuccess: () => {
			toast.success("Strategy deleted");
			utils.strategies.getAll.invalidate();
			router.push("/strategies");
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

	const handleSubmit = (data: StrategyFormData) => {
		updateMutation.mutate({
			id: strategyId,
			name: data.name,
			description: data.description || null,
			color: data.color,
			entryCriteria: data.entryCriteria || null,
			exitRules: data.exitRules || null,
			riskParameters: data.riskParameters,
			scalingRules: data.scalingRules,
			trailingRules: data.trailingRules,
			isActive: data.isActive,
			rules: data.rules,
		});
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="mx-auto w-[95%] max-w-4xl space-y-6 py-6">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-24" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	// Not found
	if (!strategy) {
		return (
			<div className="flex flex-col items-center justify-center py-24">
				<AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
				<h2 className="font-semibold text-xl">Strategy not found</h2>
				<p className="mb-4 text-muted-foreground">
					This strategy doesn&apos;t exist or you don&apos;t have access.
				</p>
				<Button asChild>
					<Link href="/strategies">Back to Strategies</Link>
				</Button>
			</div>
		);
	}

	// Transform rules for the form
	const formRules = strategy.rules.map((rule) => ({
		id: rule.id,
		text: rule.text,
		category: rule.category,
		order: rule.order,
	}));

	return (
		<div className="mx-auto w-[95%] max-w-4xl space-y-8 py-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button asChild className="h-8 w-8" size="icon" variant="ghost">
						<Link href="/strategies">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3">
						<div
							className="h-4 w-4 rounded"
							style={{ backgroundColor: strategy.color ?? "#d4ff00" }}
						/>
						<h1 className="font-bold text-2xl tracking-tight">
							{strategy.name}
						</h1>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button
						className="font-mono text-xs"
						onClick={() => duplicateMutation.mutate({ id: strategyId })}
						size="sm"
						variant="outline"
					>
						<Copy className="mr-2 h-3 w-3" />
						Duplicate
					</Button>
				</div>
			</div>

			{/* Stats summary */}
			{stats && stats.totalTrades > 0 && (
				<div className="grid grid-cols-4 gap-4">
					<div className="rounded border border-white/5 bg-white/[0.02] p-4">
						<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Trades
						</div>
						<div className="mt-1 font-bold font-mono text-2xl">
							{stats.totalTrades}
						</div>
					</div>
					<div className="rounded border border-white/5 bg-white/[0.02] p-4">
						<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Win Rate
						</div>
						<div
							className={cn(
								"mt-1 font-bold font-mono text-2xl",
								stats.winRate >= 50 ? "text-profit" : "text-loss",
							)}
						>
							{stats.winRate.toFixed(0)}%
						</div>
					</div>
					<div className="rounded border border-white/5 bg-white/[0.02] p-4">
						<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Total P&L
						</div>
						<div
							className={cn(
								"mt-1 font-bold font-mono text-2xl",
								stats.totalPnl >= 0 ? "text-profit" : "text-loss",
							)}
						>
							{stats.totalPnl >= 0 ? "+" : ""}$
							{Math.abs(stats.totalPnl).toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</div>
					</div>
					<div className="rounded border border-white/5 bg-white/[0.02] p-4">
						<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Profit Factor
						</div>
						<div
							className={cn(
								"mt-1 font-bold font-mono text-2xl",
								stats.profitFactor >= 1 ? "text-profit" : "text-loss",
							)}
						>
							{stats.profitFactor.toFixed(2)}
						</div>
					</div>
				</div>
			)}

			{/* Form */}
			<div className="rounded border border-white/5 bg-white/[0.02] p-6">
				<StrategyForm
					initialData={{
						name: strategy.name,
						description: strategy.description ?? "",
						color: strategy.color ?? "#d4ff00",
						entryCriteria: strategy.entryCriteria ?? "",
						exitRules: strategy.exitRules ?? "",
						riskParameters: strategy.riskParameters,
						scalingRules: strategy.scalingRules,
						trailingRules: strategy.trailingRules,
						isActive: strategy.isActive ?? true,
						rules: formRules,
					}}
					isSubmitting={updateMutation.isPending}
					onSubmit={handleSubmit}
					submitLabel="Save Changes"
				/>
			</div>

			{/* Danger zone */}
			<div className="rounded border border-loss/20 bg-loss/5 p-6">
				<h3 className="font-mono text-loss text-sm uppercase tracking-wider">
					Danger Zone
				</h3>
				<p className="mt-2 font-mono text-muted-foreground text-sm">
					Deleting this strategy will remove it from all associated trades.
				</p>
				<Button
					className="mt-4 font-mono text-xs uppercase tracking-wider"
					onClick={() => setIsDeleting(true)}
					variant="destructive"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Strategy
				</Button>
			</div>

			{/* Delete confirmation dialog */}
			<Dialog onOpenChange={setIsDeleting} open={isDeleting}>
				<DialogContent className="border-border bg-background">
					<DialogHeader>
						<DialogTitle className="font-mono uppercase tracking-wider">
							Delete Strategy
						</DialogTitle>
						<DialogDescription className="font-mono text-xs">
							Are you sure you want to delete &quot;{strategy.name}&quot;? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => setIsDeleting(false)} variant="ghost">
							Cancel
						</Button>
						<Button
							disabled={deleteMutation.isPending}
							onClick={() => deleteMutation.mutate({ id: strategyId })}
							variant="destructive"
						>
							{deleteMutation.isPending && (
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

