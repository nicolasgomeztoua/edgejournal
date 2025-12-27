"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PlaybookFormData } from "@/components/playbook";
import { PlaybookForm } from "@/components/playbook";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export default function NewPlaybookPage() {
	const router = useRouter();
	const utils = api.useUtils();

	const createMutation = api.playbooks.create.useMutation({
		onSuccess: (newPlaybook) => {
			toast.success("Playbook created");
			utils.playbooks.getAll.invalidate();
			router.push(`/playbooks/${newPlaybook.id}`);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create playbook");
		},
	});

	const handleSubmit = (data: PlaybookFormData) => {
		createMutation.mutate({
			name: data.name,
			description: data.description || undefined,
			color: data.color,
			entryCriteria: data.entryCriteria || undefined,
			exitRules: data.exitRules || undefined,
			riskParameters: data.riskParameters ?? undefined,
			scalingRules: data.scalingRules ?? undefined,
			trailingRules: data.trailingRules ?? undefined,
			isActive: data.isActive,
			rules: data.rules,
		});
	};

	return (
		<div className="mx-auto w-[95%] max-w-4xl space-y-8 py-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Button asChild className="h-8 w-8" size="icon" variant="ghost">
					<Link href="/playbooks">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="font-bold text-2xl tracking-tight">New Playbook</h1>
					<p className="mt-1 font-mono text-muted-foreground text-sm">
						Define your trading strategy with entry rules, risk management, and
						a checklist.
					</p>
				</div>
			</div>

			{/* Form */}
			<div className="rounded border border-white/5 bg-white/[0.02] p-6">
				<PlaybookForm
					isSubmitting={createMutation.isPending}
					onSubmit={handleSubmit}
					submitLabel="Create Playbook"
				/>
			</div>
		</div>
	);
}
