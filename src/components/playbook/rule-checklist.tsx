"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useCallback, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

interface Rule {
	id: number;
	text: string;
	category: "entry" | "exit" | "risk" | "management";
	order: number;
}

interface RuleCheck {
	ruleId: number;
	checked: boolean;
}

interface RuleChecklistProps {
	tradeId: number;
	rules: Rule[];
	checks: RuleCheck[];
	onUpdate?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
	entry: "Entry Rules",
	exit: "Exit Rules",
	risk: "Risk Rules",
	management: "Management Rules",
};

const CATEGORY_COLORS: Record<string, string> = {
	entry: "text-profit",
	exit: "text-loss",
	risk: "text-breakeven",
	management: "text-accent",
};

export function RuleChecklist({
	tradeId,
	rules,
	checks,
	onUpdate,
}: RuleChecklistProps) {
	const [pendingChecks, setPendingChecks] = useState<Map<number, boolean>>(
		new Map(),
	);

	const checkRule = api.playbooks.checkRule.useMutation({
		onMutate: ({ ruleId, checked }) => {
			setPendingChecks((prev) => new Map(prev).set(ruleId, checked));
		},
		onSuccess: () => {
			onUpdate?.();
		},
		onSettled: (_data, _error, { ruleId }) => {
			setPendingChecks((prev) => {
				const next = new Map(prev);
				next.delete(ruleId);
				return next;
			});
		},
	});

	const handleCheck = useCallback(
		(ruleId: number, checked: boolean) => {
			checkRule.mutate({ tradeId, ruleId, checked });
		},
		[tradeId, checkRule],
	);

	// Group rules by category
	const groupedRules: Record<string, Rule[]> = {};
	for (const rule of rules) {
		const category = rule.category;
		if (!groupedRules[category]) {
			groupedRules[category] = [];
		}
		groupedRules[category].push(rule);
	}

	// Get check status for a rule (with optimistic updates)
	const isChecked = (ruleId: number): boolean => {
		if (pendingChecks.has(ruleId)) {
			return pendingChecks.get(ruleId) ?? false;
		}
		return checks.find((c) => c.ruleId === ruleId)?.checked ?? false;
	};

	// Calculate optimistic compliance
	const optimisticCompliance = (() => {
		if (rules.length === 0) return 100;
		const checkedCount = rules.filter((r) => isChecked(r.id)).length;
		return (checkedCount / rules.length) * 100;
	})();

	if (rules.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="font-mono text-muted-foreground text-sm">
					No rules defined for this playbook
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Compliance indicator */}
			<div className="flex items-center justify-between rounded border border-white/10 bg-white/[0.02] p-4">
				<div>
					<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
						Rule Compliance
					</div>
					<div
						className={cn(
							"mt-1 font-bold font-mono text-2xl",
							optimisticCompliance >= 80
								? "text-profit"
								: optimisticCompliance >= 50
									? "text-breakeven"
									: "text-loss",
						)}
					>
						{optimisticCompliance.toFixed(0)}%
					</div>
				</div>

				<div className="flex items-center gap-2">
					{optimisticCompliance >= 80 ? (
						<CheckCircle2 className="h-8 w-8 text-profit" />
					) : (
						<Circle className="h-8 w-8 text-muted-foreground" />
					)}
				</div>
			</div>

			{/* Rules by category */}
			{(["entry", "exit", "risk", "management"] as const).map((category) => {
				const categoryRules = groupedRules[category];
				if (!categoryRules || categoryRules.length === 0) return null;

				return (
					<div key={category}>
						<h4
							className={cn(
								"mb-3 font-mono text-[11px] uppercase tracking-wider",
								CATEGORY_COLORS[category],
							)}
						>
							{CATEGORY_LABELS[category]}
						</h4>
						<div className="space-y-2">
							{categoryRules
								.sort((a, b) => a.order - b.order)
								.map((rule) => {
									const checked = isChecked(rule.id);
									const checkboxId = `rule-check-${rule.id}`;
									return (
										<div
											className={cn(
												"flex cursor-pointer items-start gap-3 rounded border border-white/5 bg-white/[0.01] p-3 transition-all hover:border-white/10",
												checked && "border-profit/20 bg-profit/5",
											)}
											key={rule.id}
										>
											<Checkbox
												checked={checked}
												className="mt-0.5"
												id={checkboxId}
												onCheckedChange={(value) =>
													handleCheck(rule.id, value === true)
												}
											/>
											<label
												className={cn(
													"flex-1 cursor-pointer font-mono text-sm",
													checked ? "text-foreground" : "text-muted-foreground",
												)}
												htmlFor={checkboxId}
											>
												{rule.text}
											</label>
										</div>
									);
								})}
						</div>
					</div>
				);
			})}
		</div>
	);
}
