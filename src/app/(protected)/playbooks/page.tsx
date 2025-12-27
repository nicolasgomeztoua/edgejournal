"use client";

import { BookMarked, Plus, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PlaybookCard } from "@/components/playbook";
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

export default function PlaybooksPage() {
	const router = useRouter();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [playbookToDelete, setPlaybookToDelete] = useState<number | null>(null);

	const utils = api.useUtils();

	const { data: playbooks, isLoading } = api.playbooks.getAll.useQuery({
		includeInactive: true,
	});

	const deleteMutation = api.playbooks.delete.useMutation({
		onSuccess: () => {
			toast.success("Playbook deleted");
			utils.playbooks.getAll.invalidate();
			setDeleteDialogOpen(false);
			setPlaybookToDelete(null);
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

	const handleDelete = (id: number) => {
		setPlaybookToDelete(id);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (playbookToDelete) {
			deleteMutation.mutate({ id: playbookToDelete });
		}
	};

	// Get stats for each playbook
	const playbookStats = api.useQueries((t) =>
		(playbooks ?? []).map((p) => t.playbooks.getStats({ id: p.id })),
	);

	const statsMap = new Map<
		number,
		{ winRate: number; totalPnl: number; avgPnl: number }
	>();
	playbooks?.forEach((p, i) => {
		const stats = playbookStats[i]?.data;
		if (stats) {
			statsMap.set(p.id, {
				winRate: stats.winRate,
				totalPnl: stats.totalPnl,
				avgPnl: stats.avgPnl,
			});
		}
	});

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<div className="flex items-center gap-3 mb-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<BookMarked className="h-5 w-5 text-primary" />
						</div>
						<span className="font-mono text-primary text-xs font-medium uppercase tracking-wider">
							Strategy Library
						</span>
					</div>
					<h1 className="font-bold text-4xl tracking-tight">Playbooks</h1>
					<p className="mt-2 font-mono text-muted-foreground text-sm">
						Document your trading strategies with entry rules, risk management,
						and checklists.
					</p>
				</div>
				<Button asChild className="font-mono text-xs uppercase tracking-wider">
					<Link href="/playbooks/new">
						<Plus className="mr-2 h-4 w-4" />
						New Playbook
					</Link>
				</Button>
			</div>

			{/* Loading state */}
			{isLoading && (
				<div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Skeleton className="h-52 rounded-lg" key={i} />
					))}
				</div>
			)}

			{/* Empty state */}
			{!isLoading && (!playbooks || playbooks.length === 0) && (
				<div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent py-20 px-6">
					<div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
						<BookMarked className="h-7 w-7 text-muted-foreground/40" />
					</div>
					<h2 className="mb-2 font-semibold text-lg">No playbooks yet</h2>
					<p className="mt-1 max-w-sm text-center font-mono text-muted-foreground text-xs">
						Create your first playbook to document your trading strategy and
						track rule compliance.
					</p>
					<Button
						asChild
						className="mt-6 font-mono text-xs uppercase tracking-wider"
					>
						<Link href="/playbooks/new">
							<Zap className="mr-2 h-4 w-4" />
							Create Playbook
						</Link>
					</Button>
				</div>
			)}

			{/* Playbooks grid */}
			{!isLoading && playbooks && playbooks.length > 0 && (
				<div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
					{playbooks.map((playbook) => (
						<PlaybookCard
							key={playbook.id}
							onDelete={() => handleDelete(playbook.id)}
							onDuplicate={() => duplicateMutation.mutate({ id: playbook.id })}
							onEdit={() => router.push(`/playbooks/${playbook.id}`)}
							playbook={playbook}
							stats={statsMap.get(playbook.id) ?? null}
						/>
					))}
				</div>
			)}

			{/* Delete confirmation dialog */}
			<Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
				<DialogContent className="border-white/10 bg-background">
					<DialogHeader>
						<DialogTitle className="font-mono uppercase tracking-wider">
							Delete Playbook
						</DialogTitle>
						<DialogDescription className="font-mono text-xs">
							Are you sure you want to delete this playbook? This will remove it
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
