"use client";

import { BookMarked, Camera, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ComplianceBadge, RuleChecklist } from "@/components/playbook";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { StarRating } from "@/components/ui/star-rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TradeStats } from "@/lib/trade-calculations";
import { cn, formatCurrency } from "@/lib/utils";
import { api } from "@/trpc/react";
import { EditableField } from "./editable-field";
import { type Execution, ExecutionTimeline } from "./execution-timeline";

// =============================================================================
// TYPES
// =============================================================================

interface Trade {
	id: number;
	symbol: string;
	direction: "long" | "short";
	status: "open" | "closed";
	instrumentType: "futures" | "forex";
	quantity: string;
	entryPrice: string;
	exitPrice: string | null;
	entryTime: Date | string;
	exitTime: Date | string | null;
	stopLoss: string | null;
	takeProfit: string | null;
	fees: string | null;
	netPnl: string | null;
	rating: number | null;
	playbookId: number | null;
	executions?: Execution[];
	// Risk management
	wasTrailed?: boolean | null;
	trailedStopLoss?: string | null;
	// Context
	setupType?: string | null;
	emotionalState?: string | null;
	exitReason?: string | null;
}

interface StatsPanelProps {
	trade: Trade;
	stats: TradeStats;
	onUpdateField: (
		field: string,
		value: string | number | boolean | null,
	) => void;
	onUpdateRating: (rating: number) => void;
	pendingRating: number | null;
	className?: string;
}

// =============================================================================
// STAT ROW COMPONENT
// =============================================================================

function StatRow({
	label,
	value,
	valueClassName,
	suffix,
}: {
	label: string;
	value: string | number | null | undefined;
	valueClassName?: string;
	suffix?: string;
}) {
	const displayValue = value ?? "—";
	return (
		<div className="flex items-center justify-between py-2">
			<span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
				{label}
			</span>
			<span className={cn("font-mono text-sm", valueClassName)}>
				{displayValue}
				{suffix && value != null && (
					<span className="text-muted-foreground">{suffix}</span>
				)}
			</span>
		</div>
	);
}

// =============================================================================
// PLAYBOOK SECTION
// =============================================================================

function PlaybookSection({
	tradeId,
	playbookId,
	onPlaybookChange,
}: {
	tradeId: number;
	playbookId: number | null;
	onPlaybookChange: (playbookId: number | null) => void;
}) {
	const utils = api.useUtils();
	const { data: playbooks } = api.playbooks.getAll.useQuery();
	const { data: ruleChecksData } = api.playbooks.getTradeRuleChecks.useQuery(
		{ tradeId },
		{ enabled: !!playbookId },
	);

	const updateTradeMutation = api.trades.update.useMutation({
		onSuccess: () => {
			utils.trades.getById.invalidate({ id: tradeId });
			utils.playbooks.getTradeRuleChecks.invalidate({ tradeId });
		},
	});

	const handlePlaybookChange = (value: string) => {
		const newPlaybookId = value === "none" ? null : parseInt(value, 10);
		onPlaybookChange(newPlaybookId);
		updateTradeMutation.mutate({ id: tradeId, playbookId: newPlaybookId });
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<Select
					onValueChange={handlePlaybookChange}
					value={playbookId?.toString() ?? "none"}
				>
					<SelectTrigger className="flex-1 font-mono text-xs">
						<SelectValue placeholder="Select playbook..." />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">No playbook</SelectItem>
						{playbooks?.map((pb) => (
							<SelectItem key={pb.id} value={pb.id.toString()}>
								<div className="flex items-center gap-2">
									<div
										className="h-2 w-2 rounded-full"
										style={{ backgroundColor: pb.color ?? "#d4ff00" }}
									/>
									{pb.name}
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{playbookId && ruleChecksData?.playbook && (
					<>
						<ComplianceBadge compliance={ruleChecksData.compliance} size="sm" />
						<Button asChild className="h-7 w-7" size="icon" variant="ghost">
							<Link href={`/playbooks/${playbookId}`}>
								<ExternalLink className="h-3 w-3" />
							</Link>
						</Button>
					</>
				)}
			</div>

			{playbookId && ruleChecksData && ruleChecksData.rules.length > 0 && (
				<RuleChecklist
					checks={ruleChecksData.checks}
					onUpdate={() =>
						utils.playbooks.getTradeRuleChecks.invalidate({ tradeId })
					}
					rules={ruleChecksData.rules}
					tradeId={tradeId}
				/>
			)}

			{!playbookId && (
				<div className="flex items-center gap-3 rounded border border-white/5 bg-white/[0.01] p-3">
					<BookMarked className="h-4 w-4 text-muted-foreground/50" />
					<p className="font-mono text-[11px] text-muted-foreground">
						No playbook assigned
					</p>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function StatsPanel({
	trade,
	stats,
	onUpdateField,
	onUpdateRating,
	pendingRating,
	className,
}: StatsPanelProps) {
	const netPnl = trade.netPnl ? parseFloat(trade.netPnl) : null;
	const isProfit = netPnl !== null && netPnl > 0;
	const isLoss = netPnl !== null && netPnl < 0;

	return (
		<div
			className={cn("flex h-full min-w-0 flex-col overflow-hidden", className)}
		>
			<Tabs className="flex h-full min-w-0 flex-col" defaultValue="stats">
				<TabsList className="w-full shrink-0 justify-start overflow-x-auto rounded-none border-border border-b bg-transparent px-2">
					<TabsTrigger
						className="rounded-none border-transparent border-b-2 font-mono text-[10px] uppercase tracking-wider data-[state=active]:border-primary data-[state=active]:bg-transparent"
						value="stats"
					>
						Stats
					</TabsTrigger>
					<TabsTrigger
						className="rounded-none border-transparent border-b-2 font-mono text-[10px] uppercase tracking-wider data-[state=active]:border-primary data-[state=active]:bg-transparent"
						value="strategy"
					>
						Strategy
					</TabsTrigger>
					<TabsTrigger
						className="rounded-none border-transparent border-b-2 font-mono text-[10px] uppercase tracking-wider data-[state=active]:border-primary data-[state=active]:bg-transparent"
						value="executions"
					>
						Executions
					</TabsTrigger>
					<TabsTrigger
						className="rounded-none border-transparent border-b-2 font-mono text-[10px] uppercase tracking-wider data-[state=active]:border-primary data-[state=active]:bg-transparent"
						value="attachments"
					>
						Attachments
					</TabsTrigger>
				</TabsList>

				{/* STATS TAB */}
				<TabsContent className="m-0 flex-1 overflow-hidden" value="stats">
					<ScrollArea className="h-full">
						<div className="space-y-6 p-4">
							{/* Net P&L - Hero Display */}
							<div className="border-border border-b pb-4">
								<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
									Net P&L
								</div>
								<div
									className={cn(
										"mt-1 font-bold font-mono text-3xl",
										isProfit && "text-profit",
										isLoss && "text-loss",
										!isProfit && !isLoss && "text-muted-foreground",
									)}
								>
									{netPnl !== null ? formatCurrency(netPnl) : "—"}
								</div>
							</div>

							{/* TP / SL - Quick Access */}
							<div className="grid grid-cols-2 gap-3">
								<EditableField
									label="Take Profit"
									onChange={(v) => onUpdateField("takeProfit", v)}
									type="number"
									value={trade.takeProfit}
								/>
								<EditableField
									label="Stop Loss"
									onChange={(v) => onUpdateField("stopLoss", v)}
									type="number"
									value={trade.stopLoss}
								/>
							</div>

							{/* Basic Info */}
							<div className="divide-y divide-border/50">
								<StatRow
									label="Side"
									value={trade.direction.toUpperCase()}
									valueClassName={
										trade.direction === "long" ? "text-profit" : "text-loss"
									}
								/>
								<StatRow
									label={
										trade.instrumentType === "futures"
											? "Contracts traded"
											: "Lots traded"
									}
									value={parseFloat(trade.quantity).toString()}
								/>
								<StatRow
									label="Points"
									value={stats.points?.toFixed(2)}
									valueClassName={
										stats.points !== null
											? stats.points >= 0
												? "text-profit"
												: "text-loss"
											: undefined
									}
								/>
								{trade.instrumentType === "futures" && (
									<>
										<StatRow
											label="Ticks"
											value={stats.ticks?.toFixed(1)}
											valueClassName={
												stats.ticks !== null
													? stats.ticks >= 0
														? "text-profit"
														: "text-loss"
													: undefined
											}
										/>
										<StatRow
											label="Ticks Per Contract"
											value={stats.ticksPerContract?.toFixed(1)}
										/>
									</>
								)}
								{trade.instrumentType === "forex" && (
									<StatRow
										label="Pips"
										value={stats.pips?.toFixed(1)}
										valueClassName={
											stats.pips !== null
												? stats.pips >= 0
													? "text-profit"
													: "text-loss"
												: undefined
										}
									/>
								)}
								<StatRow
									label="Commissions & Fees"
									value={
										trade.fees ? `$${parseFloat(trade.fees).toFixed(2)}` : null
									}
								/>
								<StatRow
									label="Net ROI"
									suffix="%"
									value={stats.roi?.toFixed(2)}
									valueClassName={
										stats.roi !== null
											? stats.roi >= 0
												? "text-profit"
												: "text-loss"
											: undefined
									}
								/>
								<StatRow
									label="Gross P&L"
									value={
										stats.grossPnl !== null
											? formatCurrency(stats.grossPnl)
											: null
									}
									valueClassName={
										stats.grossPnl !== null
											? stats.grossPnl >= 0
												? "text-profit"
												: "text-loss"
											: undefined
									}
								/>
							</div>

							{/* Playbook Selector */}
							<div className="space-y-2">
								<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
									Playbook
								</div>
								<Select
									onValueChange={(value) =>
										onUpdateField(
											"playbookId",
											value === "none" ? null : parseInt(value, 10),
										)
									}
									value={trade.playbookId?.toString() ?? "none"}
								>
									<SelectTrigger className="font-mono text-xs">
										<SelectValue placeholder="Select Playbook" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">Select Playbook</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* MAE/MFE Placeholder */}
							<div className="flex items-center gap-2">
								<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
									Price MAE / MFE
								</span>
								<div className="flex gap-2">
									<Badge
										className="border-loss/50 font-mono text-[10px] text-loss"
										variant="outline"
									>
										$ —
									</Badge>
									<span className="text-muted-foreground">/</span>
									<Badge
										className="border-profit/50 font-mono text-[10px] text-profit"
										variant="outline"
									>
										$ —
									</Badge>
								</div>
							</div>

							{/* Running P&L Mini Chart Placeholder */}
							<div className="space-y-2">
								<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
									Running P&L
								</div>
								<div className="flex h-12 items-center justify-center rounded border border-white/5 bg-white/[0.01]">
									<span className="font-mono text-[10px] text-muted-foreground/50">
										Chart coming soon
									</span>
								</div>
							</div>

							{/* Trade Rating */}
							<div className="space-y-2">
								<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
									Trade Rating
								</div>
								<StarRating
									onChange={(rating) => onUpdateRating(rating ?? 0)}
									size="md"
									value={pendingRating ?? trade.rating ?? 0}
								/>
							</div>

							{/* Risk Management Section */}
							<div className="space-y-4">
								<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
									Risk Management
								</div>

								{/* Trailing Stop */}
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Checkbox
											checked={trade.wasTrailed ?? false}
											id="was-trailed"
											onCheckedChange={(checked) =>
												onUpdateField("wasTrailed", checked === true)
											}
										/>
										<label
											className="cursor-pointer font-mono text-xs"
											htmlFor="was-trailed"
										>
											Stop was trailed
										</label>
									</div>

									{trade.wasTrailed && (
										<EditableField
											label="Trailed Stop Loss"
											onChange={(v) => onUpdateField("trailedStopLoss", v)}
											type="number"
											value={trade.trailedStopLoss}
										/>
									)}
								</div>

								{/* Exit Reason */}
								<div className="space-y-1">
									<div className="font-mono text-[10px] text-muted-foreground uppercase">
										Exit Reason
									</div>
									<Select
										onValueChange={(v) =>
											onUpdateField("exitReason", v === "none" ? null : v)
										}
										value={trade.exitReason ?? "none"}
									>
										<SelectTrigger className="font-mono text-xs">
											<SelectValue placeholder="Select reason..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">Not specified</SelectItem>
											<SelectItem value="manual">Manual</SelectItem>
											<SelectItem value="stop_loss">Stop Loss</SelectItem>
											<SelectItem value="trailing_stop">
												Trailing Stop
											</SelectItem>
											<SelectItem value="take_profit">Take Profit</SelectItem>
											<SelectItem value="time_based">Time Based</SelectItem>
											<SelectItem value="breakeven">Breakeven</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Context Section */}
							<div className="space-y-4">
								<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
									Trade Context
								</div>

								{/* Setup Type */}
								<EditableField
									label="Setup Type"
									onChange={(v) => onUpdateField("setupType", v)}
									placeholder="e.g., Breakout, Pullback..."
									type="text"
									value={trade.setupType}
								/>

								{/* Emotional State */}
								<div className="space-y-1">
									<div className="font-mono text-[10px] text-muted-foreground uppercase">
										Emotional State
									</div>
									<Select
										onValueChange={(v) =>
											onUpdateField("emotionalState", v === "none" ? null : v)
										}
										value={trade.emotionalState ?? "none"}
									>
										<SelectTrigger className="font-mono text-xs">
											<SelectValue placeholder="Select state..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">Not specified</SelectItem>
											<SelectItem value="confident">😎 Confident</SelectItem>
											<SelectItem value="neutral">😐 Neutral</SelectItem>
											<SelectItem value="anxious">😰 Anxious</SelectItem>
											<SelectItem value="fearful">😨 Fearful</SelectItem>
											<SelectItem value="greedy">🤑 Greedy</SelectItem>
											<SelectItem value="frustrated">😤 Frustrated</SelectItem>
											<SelectItem value="excited">🤩 Excited</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* R-Multiple Stats */}
							<div className="divide-y divide-border/50">
								<StatRow label="Initial Target" value="—" />
								<StatRow label="Trade Risk" value="—" />
								<StatRow
									label="Planned R-Multiple"
									suffix="R"
									value={stats.plannedRR?.toFixed(2)}
								/>
								<StatRow
									label="Realized R-Multiple"
									suffix="R"
									value={stats.rMultiple?.toFixed(2)}
									valueClassName={
										stats.rMultiple !== null
											? stats.rMultiple >= 0
												? "text-profit"
												: "text-loss"
											: undefined
									}
								/>
							</div>

							{/* Entry/Exit Prices */}
							<div className="divide-y divide-border/50">
								<StatRow
									label="Average Entry"
									value={`$${parseFloat(trade.entryPrice).toLocaleString()}`}
								/>
								<StatRow
									label="Average Exit"
									value={
										trade.exitPrice
											? `$${parseFloat(trade.exitPrice).toLocaleString()}`
											: null
									}
								/>
							</div>

							{/* Entry/Exit Times */}
							<div className="divide-y divide-border/50">
								<StatRow
									label="Entry Time"
									value={new Date(trade.entryTime).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								/>
								<StatRow
									label="Exit Time"
									value={
										trade.exitTime
											? new Date(trade.exitTime).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})
											: null
									}
								/>
							</div>
						</div>
					</ScrollArea>
				</TabsContent>

				{/* STRATEGY TAB */}
				<TabsContent
					className="m-0 flex-1 overflow-hidden p-4"
					value="strategy"
				>
					<PlaybookSection
						onPlaybookChange={(id) => onUpdateField("playbookId", id)}
						playbookId={trade.playbookId}
						tradeId={trade.id}
					/>
				</TabsContent>

				{/* EXECUTIONS TAB */}
				<TabsContent
					className="m-0 flex-1 overflow-hidden p-4"
					value="executions"
				>
					<ExecutionTimeline
						executions={trade.executions ?? []}
						instrumentType={trade.instrumentType}
						onAddExecution={() => {
							// TODO: Implement add execution
						}}
					/>
				</TabsContent>

				{/* ATTACHMENTS TAB */}
				<TabsContent
					className="m-0 flex-1 overflow-hidden p-4"
					value="attachments"
				>
					<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
						<Camera className="mb-3 h-10 w-10 opacity-50" />
						<p className="font-mono text-xs">Drop images or click to upload</p>
						<p className="mt-1 font-mono text-[10px] opacity-50">Coming soon</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
