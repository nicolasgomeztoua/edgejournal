import { CandlestickChart, TrendingDown, TrendingUp } from "lucide-react";
import { TradeTags } from "@/components/tags/tag-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { EditableTextarea } from "./editable-field";

// =============================================================================
// TYPES
// =============================================================================

interface Trade {
	id: number;
	symbol: string;
	direction: "long" | "short";
	status: "open" | "closed";
	entryPrice: string;
	exitPrice: string | null;
	stopLoss: string | null;
	takeProfit: string | null;
	notes: string | null;
	tradeTags?: Array<{
		tagId: number;
		tag: {
			id: number;
			name: string;
			color: string | null;
		};
	}>;
}

interface ContentPanelProps {
	trade: Trade;
	onUpdateField: (
		field: string,
		value: string | number | boolean | null,
	) => void;
	className?: string;
}

// =============================================================================
// CHART PLACEHOLDER
// =============================================================================

function ChartPlaceholder({ trade }: { trade: Trade }) {
	return (
		<div className="relative h-full w-full overflow-hidden rounded bg-secondary">
			{/* Grid background */}
			<div
				className="absolute inset-0 opacity-20"
				style={{
					backgroundImage: `
						linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
						linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
					`,
					backgroundSize: "40px 20px",
				}}
			/>

			{/* Entry/Exit markers */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="relative flex w-full items-center px-12">
					{/* Simulated price line */}
					<div className="absolute top-1/2 right-12 left-12 h-px bg-gradient-to-r from-profit/50 via-white/30 to-loss/50" />

					{/* Entry marker */}
					<div className="absolute left-[20%] flex flex-col items-center">
						<div className="mb-1 font-mono text-[10px] text-profit">ENTRY</div>
						<div className="flex h-6 w-6 items-center justify-center rounded-full border border-profit bg-profit/20">
							<TrendingUp className="h-3 w-3 text-profit" />
						</div>
						<div className="mt-1 font-mono text-[10px] text-muted-foreground">
							{trade.entryPrice}
						</div>
					</div>

					{/* Exit marker */}
					{trade.status === "closed" && trade.exitPrice && (
						<div className="absolute left-[80%] flex flex-col items-center">
							<div className="mb-1 font-mono text-[10px] text-loss">EXIT</div>
							<div className="flex h-6 w-6 items-center justify-center rounded-full border border-loss bg-loss/20">
								<TrendingDown className="h-3 w-3 text-loss" />
							</div>
							<div className="mt-1 font-mono text-[10px] text-muted-foreground">
								{trade.exitPrice}
							</div>
						</div>
					)}

					{/* Stop loss line */}
					{trade.stopLoss && (
						<div className="absolute top-[70%] right-12 flex items-center gap-2">
							<div className="h-px w-full border-loss/50 border-t border-dashed" />
							<span className="whitespace-nowrap font-mono text-[9px] text-loss/70">
								SL {trade.stopLoss}
							</span>
						</div>
					)}

					{/* Take profit line */}
					{trade.takeProfit && (
						<div className="absolute top-[30%] right-12 flex items-center gap-2">
							<div className="h-px w-full border-profit/50 border-t border-dashed" />
							<span className="whitespace-nowrap font-mono text-[9px] text-profit/70">
								TP {trade.takeProfit}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Coming soon overlay */}
			<div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]">
				<CandlestickChart className="mb-3 h-10 w-10 text-primary/60" />
				<p className="font-mono text-sm text-white/80">Interactive Chart</p>
				<p className="font-mono text-[10px] text-muted-foreground">
					TradingView integration coming soon
				</p>
			</div>
		</div>
	);
}

// =============================================================================
// NOTES SECTION
// =============================================================================

function NotesSection({
	trade,
	onUpdateField,
}: {
	trade: Trade;
	onUpdateField: (field: string, value: string | null) => void;
}) {
	const utils = api.useUtils();

	return (
		<div className="space-y-6">
			{/* Sub-tabs for Trade note vs Daily Journal */}
			<Tabs defaultValue="trade-note">
				<TabsList className="w-full justify-start bg-transparent">
					<TabsTrigger
						className="rounded-none border-transparent border-b-2 font-mono text-[10px] uppercase tracking-wider data-[state=active]:border-primary data-[state=active]:bg-transparent"
						value="trade-note"
					>
						Trade note
					</TabsTrigger>
					<TabsTrigger
						className="rounded-none border-transparent border-b-2 font-mono text-[10px] uppercase tracking-wider data-[state=active]:border-primary data-[state=active]:bg-transparent"
						value="daily-journal"
					>
						Daily Journal
					</TabsTrigger>
				</TabsList>

				<TabsContent className="mt-4" value="trade-note">
					<EditableTextarea
						onChange={(v) => onUpdateField("notes", v || null)}
						placeholder="Add notes about this trade..."
						rows={6}
						value={trade.notes}
					/>
				</TabsContent>

				<TabsContent className="mt-4" value="daily-journal">
					<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
						<p className="font-mono text-xs">Daily journal coming soon</p>
						<p className="mt-1 font-mono text-[10px] opacity-50">
							Notes for the entire trading day
						</p>
					</div>
				</TabsContent>
			</Tabs>

			{/* Tags Section */}
			<div className="space-y-2">
				<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
					Tags
				</div>
				<TradeTags
					maxDisplay={10}
					onUpdate={() => utils.trades.getById.invalidate({ id: trade.id })}
					tags={trade.tradeTags ?? []}
					tradeId={trade.id}
				/>
			</div>
		</div>
	);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ContentPanel({
	trade,
	onUpdateField,
	className,
}: ContentPanelProps) {
	return (
		<div
			className={cn("flex h-full min-w-0 flex-col overflow-hidden", className)}
		>
			<Tabs className="flex h-full min-w-0 flex-col" defaultValue="chart">
				<TabsList className="w-full shrink-0 justify-start overflow-x-auto rounded-none border-border border-b bg-transparent px-2">
					<TabsTrigger
						className="rounded-none border-transparent border-b-2 font-mono text-[10px] uppercase tracking-wider data-[state=active]:border-primary data-[state=active]:bg-transparent"
						value="chart"
					>
						Chart
					</TabsTrigger>
					<TabsTrigger
						className="rounded-none border-transparent border-b-2 font-mono text-[10px] uppercase tracking-wider data-[state=active]:border-primary data-[state=active]:bg-transparent"
						value="notes"
					>
						Notes
					</TabsTrigger>
					<TabsTrigger
						className="rounded-none border-transparent border-b-2 font-mono text-[10px] uppercase tracking-wider data-[state=active]:border-primary data-[state=active]:bg-transparent"
						value="running-pnl"
					>
						Running P&L
					</TabsTrigger>
				</TabsList>

				{/* CHART TAB */}
				<TabsContent className="m-0 flex-1 p-4" value="chart">
					<ChartPlaceholder trade={trade} />
				</TabsContent>

				{/* NOTES TAB */}
				<TabsContent className="m-0 flex-1" value="notes">
					<ScrollArea className="h-full">
						<div className="p-4">
							<NotesSection onUpdateField={onUpdateField} trade={trade} />
						</div>
					</ScrollArea>
				</TabsContent>

				{/* RUNNING P&L TAB */}
				<TabsContent className="m-0 flex-1 p-4" value="running-pnl">
					<div className="flex h-full flex-col items-center justify-center text-muted-foreground">
						<CandlestickChart className="mb-3 h-10 w-10 opacity-50" />
						<p className="font-mono text-xs">Running P&L Chart</p>
						<p className="mt-1 font-mono text-[10px] opacity-50">
							P&L over time coming soon
						</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
