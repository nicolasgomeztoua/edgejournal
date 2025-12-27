"use client";

import { AlertTriangle, ArrowLeft, Copy, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { PlaybookFormData } from "@/components/playbook";
import { PlaybookForm } from "@/components/playbook";
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

export default function PlaybookDetailPage() {
	const params = useParams();
	const router = useRouter();
	const playbookId = parseInt(params.id as string, 10);

	const [isDeleting, setIsDeleting] = useState(false);

	const utils = api.useUtils();

	const { data: playbook, isLoading } = api.playbooks.getById.useQuery(
		{ id: playbookId },
		{ enabled: !Number.isNaN(playbookId) },
	);

	const { data: stats } = api.playbooks.getStats.useQuery(
		{ id: playbookId },
		{ enabled: !Number.isNaN(playbookId) && !!playbook },
	);

	const updateMutation = api.playbooks.update.useMutation({
		onSuccess: () => {
			toast.success("Playbook updated");
			utils.playbooks.getById.invalidate({ id: playbookId });
			utils.playbooks.getAll.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update playbook");
		},
	});

	const deleteMutation = api.playbooks.delete.useMutation({
		onSuccess: () => {
			toast.success("Playbook deleted");
			utils.playbooks.getAll.invalidate();
			router.push("/playbooks");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete playbook");
		},
	});

	const duplicateMutation = api.playbooks.duplicate.useMutation({
		onSuccess: (newPlaybook) => {
			toast.success("Playbook duplicated");
			utils.playbooks.getAll.invalidate();
			router.push(`/playbooks/${newPlaybook.id}`);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to duplicate playbook");
		},
	});

	const handleSubmit = (data: PlaybookFormData) => {
		updateMutation.mutate({
			id: playbookId,
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
	if (!playbook) {
		return (
			<div className="flex flex-col items-center justify-center py-24">
				<AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
				<h2 className="font-semibold text-xl">Playbook not found</h2>
				<p className="mb-4 text-muted-foreground">
					This playbook doesn&apos;t exist or you don&apos;t have access.
				</p>
				<Button asChild>
					<Link href="/playbooks">Back to Playbooks</Link>
				</Button>
			</div>
		);
	}

	// Transform rules for the form
	const formRules = playbook.rules.map((rule) => ({
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
						<Link href="/playbooks">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-3">
						<div
							className="h-4 w-4 rounded"
							style={{ backgroundColor: playbook.color ?? "#d4ff00" }}
						/>
						<h1 className="font-bold text-2xl tracking-tight">
							{playbook.name}
						</h1>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button
						className="font-mono text-xs"
						onClick={() => duplicateMutation.mutate({ id: playbookId })}
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
				<PlaybookForm
					initialData={{
						name: playbook.name,
						description: playbook.description ?? "",
						color: playbook.color ?? "#d4ff00",
						entryCriteria: playbook.entryCriteria ?? "",
						exitRules: playbook.exitRules ?? "",
						riskParameters: playbook.riskParameters,
						scalingRules: playbook.scalingRules,
						trailingRules: playbook.trailingRules,
						isActive: playbook.isActive ?? true,
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
					Deleting this playbook will remove it from all associated trades.
				</p>
				<Button
					className="mt-4 font-mono text-xs uppercase tracking-wider"
					onClick={() => setIsDeleting(true)}
					variant="destructive"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Playbook
				</Button>
			</div>

			{/* Delete confirmation dialog */}
			<Dialog onOpenChange={setIsDeleting} open={isDeleting}>
				<DialogContent className="border-border bg-background">
					<DialogHeader>
						<DialogTitle className="font-mono uppercase tracking-wider">
							Delete Playbook
						</DialogTitle>
						<DialogDescription className="font-mono text-xs">
							Are you sure you want to delete &quot;{playbook.name}&quot;? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => setIsDeleting(false)} variant="ghost">
							Cancel
						</Button>
						<Button
							disabled={deleteMutation.isPending}
							onClick={() => deleteMutation.mutate({ id: playbookId })}
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
