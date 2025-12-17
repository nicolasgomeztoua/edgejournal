"use client";

import {
	BookOpen,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Edit,
	Loader2,
	Plus,
	Save,
	Star,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

const EMOTIONAL_STATES = [
	{ value: "confident", label: "😊 Confident", color: "text-profit" },
	{ value: "neutral", label: "😐 Neutral", color: "text-muted-foreground" },
	{ value: "anxious", label: "😰 Anxious", color: "text-yellow-500" },
	{ value: "fearful", label: "😨 Fearful", color: "text-loss" },
	{ value: "greedy", label: "🤑 Greedy", color: "text-yellow-500" },
	{ value: "frustrated", label: "😤 Frustrated", color: "text-loss" },
	{ value: "excited", label: "🤩 Excited", color: "text-profit" },
];

function DailyJournal() {
	const [selectedDate, setSelectedDate] = useState(
		new Date().toISOString().split("T")[0] as string,
	);
	const [isEditing, setIsEditing] = useState(false);
	const [form, setForm] = useState({
		preMarketNotes: "",
		postMarketNotes: "",
		lessonsLearned: "",
		emotionalState: "" as
			| ""
			| "confident"
			| "fearful"
			| "greedy"
			| "neutral"
			| "frustrated"
			| "excited"
			| "anxious",
		rating: 0,
	});

	const { data: entry, isLoading } = api.journal.getByDate.useQuery({
		date: selectedDate,
	});

	const upsertEntry = api.journal.upsert.useMutation({
		onSuccess: () => {
			toast.success("Journal entry saved");
			setIsEditing(false);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to save");
		},
	});

	useEffect(() => {
		if (entry) {
			setForm({
				preMarketNotes: entry.preMarketNotes || "",
				postMarketNotes: entry.postMarketNotes || "",
				lessonsLearned: entry.lessonsLearned || "",
				emotionalState: entry.emotionalState || "",
				rating: entry.rating || 0,
			});
		} else {
			setForm({
				preMarketNotes: "",
				postMarketNotes: "",
				lessonsLearned: "",
				emotionalState: "",
				rating: 0,
			});
		}
	}, [entry]);

	const goToPreviousDay = () => {
		const date = new Date(selectedDate);
		date.setDate(date.getDate() - 1);
		setSelectedDate(date.toISOString().split("T")[0] as string);
		setIsEditing(false);
	};

	const goToNextDay = () => {
		const date = new Date(selectedDate);
		date.setDate(date.getDate() + 1);
		setSelectedDate(date.toISOString().split("T")[0] as string);
		setIsEditing(false);
	};

	const goToToday = () => {
		setSelectedDate(new Date().toISOString().split("T")[0] as string);
		setIsEditing(false);
	};

	const handleSave = () => {
		upsertEntry.mutate({
			date: selectedDate,
			preMarketNotes: form.preMarketNotes || undefined,
			postMarketNotes: form.postMarketNotes || undefined,
			lessonsLearned: form.lessonsLearned || undefined,
			emotionalState: form.emotionalState || undefined,
			rating: form.rating || undefined,
		});
	};

	const formatDisplayDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const isToday = selectedDate === new Date().toISOString().split("T")[0];

	return (
		<div className="space-y-6">
			{/* Date Navigation */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button onClick={goToPreviousDay} size="icon" variant="outline">
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="text-center">
						<h2 className="font-medium font-mono text-lg">
							{formatDisplayDate(selectedDate)}
						</h2>
						{isToday && (
							<Badge className="mt-1" variant="secondary">
								Today
							</Badge>
						)}
					</div>
					<Button onClick={goToNextDay} size="icon" variant="outline">
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
				<div className="flex items-center gap-2">
					{!isToday && (
						<Button onClick={goToToday} size="sm" variant="outline">
							Today
						</Button>
					)}
					{!isEditing ? (
						<Button onClick={() => setIsEditing(true)} size="sm">
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</Button>
					) : (
						<>
							<Button
								onClick={() => setIsEditing(false)}
								size="sm"
								variant="outline"
							>
								Cancel
							</Button>
							<Button
								disabled={upsertEntry.isPending}
								onClick={handleSave}
								size="sm"
							>
								{upsertEntry.isPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Save className="mr-2 h-4 w-4" />
								)}
								Save
							</Button>
						</>
					)}
				</div>
			</div>

			{isLoading ? (
				<div className="space-y-4">
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
				</div>
			) : isEditing ? (
				<div className="space-y-6">
					{/* Rating & Emotional State */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>Day Rating</Label>
							<div className="flex gap-2">
								{[1, 2, 3, 4, 5].map((star) => (
									<button
										className={cn(
											"transition-colors",
											form.rating >= star
												? "text-yellow-500"
												: "text-muted-foreground/30 hover:text-yellow-500/50",
										)}
										key={star}
										onClick={() => setForm({ ...form, rating: star })}
										type="button"
									>
										<Star
											className="h-8 w-8"
											fill={form.rating >= star ? "currentColor" : "none"}
										/>
									</button>
								))}
							</div>
						</div>
						<div className="space-y-2">
							<Label>Emotional State</Label>
							<Select
								onValueChange={(v) =>
									setForm({
										...form,
										emotionalState: v as typeof form.emotionalState,
									})
								}
								value={form.emotionalState}
							>
								<SelectTrigger>
									<SelectValue placeholder="How did you feel?" />
								</SelectTrigger>
								<SelectContent>
									{EMOTIONAL_STATES.map((state) => (
										<SelectItem key={state.value} value={state.value}>
											{state.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Pre-Market Notes */}
					<div className="space-y-2">
						<Label>Pre-Market Analysis & Plan</Label>
						<Textarea
							className="min-h-[120px]"
							onChange={(e) =>
								setForm({ ...form, preMarketNotes: e.target.value })
							}
							placeholder="What's your plan for today? Key levels, news events, market bias..."
							value={form.preMarketNotes}
						/>
					</div>

					{/* Post-Market Notes */}
					<div className="space-y-2">
						<Label>Post-Market Recap</Label>
						<Textarea
							className="min-h-[120px]"
							onChange={(e) =>
								setForm({ ...form, postMarketNotes: e.target.value })
							}
							placeholder="How did the day go? What trades did you take? Did you follow your plan?"
							value={form.postMarketNotes}
						/>
					</div>

					{/* Lessons Learned */}
					<div className="space-y-2">
						<Label>Lessons Learned</Label>
						<Textarea
							className="min-h-[80px]"
							onChange={(e) =>
								setForm({ ...form, lessonsLearned: e.target.value })
							}
							placeholder="Key takeaways from today's trading..."
							value={form.lessonsLearned}
						/>
					</div>
				</div>
			) : (
				<div className="space-y-6">
					{/* Rating & Emotional State Display */}
					{(form.rating || form.emotionalState) && (
						<div className="flex items-center gap-6">
							{form.rating > 0 && (
								<div className="flex gap-1">
									{[1, 2, 3, 4, 5].map((star) => (
										<Star
											className={cn(
												"h-6 w-6",
												form.rating >= star
													? "fill-yellow-500 text-yellow-500"
													: "text-muted-foreground/20",
											)}
											key={star}
										/>
									))}
								</div>
							)}
							{form.emotionalState && (
								<Badge
									className={cn(
										"gap-1",
										EMOTIONAL_STATES.find(
											(s) => s.value === form.emotionalState,
										)?.color,
									)}
									variant="outline"
								>
									{
										EMOTIONAL_STATES.find(
											(s) => s.value === form.emotionalState,
										)?.label
									}
								</Badge>
							)}
						</div>
					)}

					{/* Pre-Market */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-sm">
								<Calendar className="h-4 w-4 text-primary" />
								Pre-Market Analysis & Plan
							</CardTitle>
						</CardHeader>
						<CardContent>
							{form.preMarketNotes ? (
								<p className="whitespace-pre-wrap text-white/80 leading-relaxed">
									{form.preMarketNotes}
								</p>
							) : (
								<p className="text-muted-foreground italic">
									No pre-market notes recorded
								</p>
							)}
						</CardContent>
					</Card>

					{/* Post-Market */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-sm">
								<BookOpen className="h-4 w-4 text-accent" />
								Post-Market Recap
							</CardTitle>
						</CardHeader>
						<CardContent>
							{form.postMarketNotes ? (
								<p className="whitespace-pre-wrap text-white/80 leading-relaxed">
									{form.postMarketNotes}
								</p>
							) : (
								<p className="text-muted-foreground italic">
									No post-market notes recorded
								</p>
							)}
						</CardContent>
					</Card>

					{/* Lessons */}
					{form.lessonsLearned && (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-sm">
									<Star className="h-4 w-4 text-yellow-500" />
									Lessons Learned
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="whitespace-pre-wrap text-white/80 leading-relaxed">
									{form.lessonsLearned}
								</p>
							</CardContent>
						</Card>
					)}

					{!form.preMarketNotes &&
						!form.postMarketNotes &&
						!form.lessonsLearned && (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<BookOpen className="mb-4 h-12 w-12 text-muted-foreground/30" />
								<h3 className="font-medium">No journal entry for this day</h3>
								<p className="mt-1 text-muted-foreground text-sm">
									Click Edit to add your notes
								</p>
							</div>
						)}
				</div>
			)}
		</div>
	);
}

function StrategyCard({
	strategy,
	onEdit,
	onDelete,
}: {
	strategy: {
		id: number;
		name: string;
		description: string | null;
		rules: string | null;
		isActive: boolean | null;
	};
	onEdit: () => void;
	onDelete: () => void;
}) {
	return (
		<Card
			className={cn(
				"transition-all hover:border-white/20",
				!strategy.isActive && "opacity-50",
			)}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-base">{strategy.name}</CardTitle>
						{strategy.description && (
							<CardDescription className="mt-1">
								{strategy.description}
							</CardDescription>
						)}
					</div>
					<div className="flex items-center gap-1">
						<Button onClick={onEdit} size="icon" variant="ghost">
							<Edit className="h-4 w-4" />
						</Button>
						<Button onClick={onDelete} size="icon" variant="ghost">
							<Trash2 className="h-4 w-4 text-destructive" />
						</Button>
					</div>
				</div>
			</CardHeader>
			{strategy.rules && (
				<CardContent>
					<p className="line-clamp-3 text-muted-foreground text-sm">
						{strategy.rules}
					</p>
				</CardContent>
			)}
		</Card>
	);
}

function PlaybookStrategies() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingStrategy, setEditingStrategy] = useState<number | null>(null);
	const [form, setForm] = useState({
		name: "",
		description: "",
		rules: "",
		riskManagement: "",
		bestConditions: "",
		worstConditions: "",
	});

	const { data: strategies = [], refetch } =
		api.journal.getStrategies.useQuery();

	const createStrategy = api.journal.createStrategy.useMutation({
		onSuccess: () => {
			toast.success("Strategy created");
			setIsDialogOpen(false);
			resetForm();
			refetch();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create strategy");
		},
	});

	const updateStrategy = api.journal.updateStrategy.useMutation({
		onSuccess: () => {
			toast.success("Strategy updated");
			setIsDialogOpen(false);
			setEditingStrategy(null);
			resetForm();
			refetch();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update strategy");
		},
	});

	const deleteStrategy = api.journal.deleteStrategy.useMutation({
		onSuccess: () => {
			toast.success("Strategy deleted");
			refetch();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete strategy");
		},
	});

	const resetForm = () => {
		setForm({
			name: "",
			description: "",
			rules: "",
			riskManagement: "",
			bestConditions: "",
			worstConditions: "",
		});
	};

	const openEditStrategy = (strategy: (typeof strategies)[0]) => {
		setEditingStrategy(strategy.id);
		setForm({
			name: strategy.name,
			description: strategy.description || "",
			rules: strategy.rules || "",
			riskManagement: strategy.riskManagement || "",
			bestConditions: strategy.bestConditions || "",
			worstConditions: strategy.worstConditions || "",
		});
		setIsDialogOpen(true);
	};

	const handleSubmit = () => {
		if (!form.name.trim()) {
			toast.error("Strategy name is required");
			return;
		}

		if (editingStrategy) {
			updateStrategy.mutate({
				id: editingStrategy,
				...form,
			});
		} else {
			createStrategy.mutate(form);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-medium text-lg">Trading Strategies</h2>
					<p className="text-muted-foreground text-sm">
						Document your strategies and rules
					</p>
				</div>
				<Dialog
					onOpenChange={(open) => {
						setIsDialogOpen(open);
						if (!open) {
							setEditingStrategy(null);
							resetForm();
						}
					}}
					open={isDialogOpen}
				>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Add Strategy
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>
								{editingStrategy ? "Edit Strategy" : "Create Strategy"}
							</DialogTitle>
							<DialogDescription>
								Document your trading strategy with detailed rules
							</DialogDescription>
						</DialogHeader>
						<div className="max-h-[60vh] space-y-4 overflow-y-auto">
							<div className="space-y-2">
								<Label>Strategy Name *</Label>
								<Input
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									placeholder="e.g., Morning Gap Fade"
									value={form.name}
								/>
							</div>
							<div className="space-y-2">
								<Label>Description</Label>
								<Textarea
									onChange={(e) =>
										setForm({ ...form, description: e.target.value })
									}
									placeholder="Brief overview of the strategy..."
									value={form.description}
								/>
							</div>
							<div className="space-y-2">
								<Label>Entry & Exit Rules</Label>
								<Textarea
									className="min-h-[100px]"
									onChange={(e) => setForm({ ...form, rules: e.target.value })}
									placeholder="When to enter, when to exit, key triggers..."
									value={form.rules}
								/>
							</div>
							<div className="space-y-2">
								<Label>Risk Management</Label>
								<Textarea
									onChange={(e) =>
										setForm({ ...form, riskManagement: e.target.value })
									}
									placeholder="Position sizing, stop loss placement, risk per trade..."
									value={form.riskManagement}
								/>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label>Best Conditions</Label>
									<Textarea
										onChange={(e) =>
											setForm({ ...form, bestConditions: e.target.value })
										}
										placeholder="When to use this strategy..."
										value={form.bestConditions}
									/>
								</div>
								<div className="space-y-2">
									<Label>Worst Conditions</Label>
									<Textarea
										onChange={(e) =>
											setForm({ ...form, worstConditions: e.target.value })
										}
										placeholder="When to avoid this strategy..."
										value={form.worstConditions}
									/>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={() => {
									setIsDialogOpen(false);
									setEditingStrategy(null);
									resetForm();
								}}
								variant="outline"
							>
								Cancel
							</Button>
							<Button
								disabled={createStrategy.isPending || updateStrategy.isPending}
								onClick={handleSubmit}
							>
								{(createStrategy.isPending || updateStrategy.isPending) && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								{editingStrategy ? "Update" : "Create"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{strategies.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<BookOpen className="mb-4 h-12 w-12 text-muted-foreground/30" />
					<h3 className="font-medium">No strategies yet</h3>
					<p className="mt-1 text-muted-foreground text-sm">
						Create your first trading strategy to document your edge
					</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{strategies.map((strategy) => (
						<StrategyCard
							key={strategy.id}
							onDelete={() => {
								if (confirm("Are you sure you want to delete this strategy?")) {
									deleteStrategy.mutate({ id: strategy.id });
								}
							}}
							onEdit={() => openEditStrategy(strategy)}
							strategy={strategy}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default function PlaybookPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Playbook</h1>
				<p className="text-muted-foreground">
					Daily journal and trading strategies
				</p>
			</div>

			<Tabs defaultValue="journal">
				<TabsList>
					<TabsTrigger className="gap-2" value="journal">
						<Calendar className="h-4 w-4" />
						Daily Journal
					</TabsTrigger>
					<TabsTrigger className="gap-2" value="strategies">
						<BookOpen className="h-4 w-4" />
						Strategies
					</TabsTrigger>
				</TabsList>

				<TabsContent className="mt-6" value="journal">
					<DailyJournal />
				</TabsContent>

				<TabsContent className="mt-6" value="strategies">
					<PlaybookStrategies />
				</TabsContent>
			</Tabs>
		</div>
	);
}
