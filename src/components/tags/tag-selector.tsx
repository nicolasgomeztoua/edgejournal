"use client";

import { Check, Plus, Tag, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

interface TagSelectorProps {
	tradeId: number;
	currentTagIds: number[];
	onUpdate?: () => void;
}

export function TagSelector({
	tradeId,
	currentTagIds,
	onUpdate,
}: TagSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [newTagName, setNewTagName] = useState("");

	const { data: tags, refetch: refetchTags } = api.tags.getAll.useQuery();

	const addTag = api.tags.addToTrade.useMutation({
		onSuccess: () => {
			onUpdate?.();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to add tag");
		},
	});

	const removeTag = api.tags.removeFromTrade.useMutation({
		onSuccess: () => {
			onUpdate?.();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to remove tag");
		},
	});

	const createTag = api.tags.create.useMutation({
		onSuccess: (newTag) => {
			refetchTags();
			if (newTag) {
				addTag.mutate({ tradeId, tagId: newTag.id });
			}
			setNewTagName("");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create tag");
		},
	});

	const handleToggleTag = (tagId: number, isSelected: boolean) => {
		if (isSelected) {
			removeTag.mutate({ tradeId, tagId });
		} else {
			addTag.mutate({ tradeId, tagId });
		}
	};

	const handleCreateAndAdd = () => {
		if (!newTagName.trim()) return;
		createTag.mutate({ name: newTagName.trim() });
	};

	return (
		<DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					className="h-7 px-2 font-mono text-xs"
					size="sm"
					variant="ghost"
				>
					<Tag className="h-3.5 w-3.5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
					Assign Tags
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{tags && tags.length > 0 ? (
					<div className="max-h-48 overflow-y-auto">
						{tags.map((tag) => {
							const isSelected = currentTagIds.includes(tag.id);
							return (
								<DropdownMenuItem
									className="flex items-center gap-2 font-mono text-xs"
									key={tag.id}
									onSelect={(e) => {
										e.preventDefault();
										handleToggleTag(tag.id, isSelected);
									}}
								>
									<div
										className="h-3 w-3 rounded-full"
										style={{ backgroundColor: tag.color ?? "#6366f1" }}
									/>
									<span className="flex-1">{tag.name}</span>
									{isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
								</DropdownMenuItem>
							);
						})}
					</div>
				) : (
					<div className="px-2 py-3 text-center">
						<p className="font-mono text-muted-foreground text-xs">
							No tags yet
						</p>
					</div>
				)}

				<DropdownMenuSeparator />

				<div className="p-2">
					<div className="flex gap-2">
						<Input
							className="h-7 font-mono text-xs"
							onChange={(e) => setNewTagName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleCreateAndAdd();
								}
							}}
							placeholder="New tag..."
							value={newTagName}
						/>
						<Button
							className="h-7 px-2"
							disabled={!newTagName.trim() || createTag.isPending}
							onClick={handleCreateAndAdd}
							size="sm"
						>
							<Plus className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// Compact tag display with inline tag selector
interface TradeTagsProps {
	tradeId: number;
	tags: Array<{
		tagId: number;
		tag: { id: number; name: string; color: string | null };
	}>;
	onUpdate?: () => void;
	maxDisplay?: number;
}

export function TradeTags({
	tradeId,
	tags,
	onUpdate,
	maxDisplay = 2,
}: TradeTagsProps) {
	const removeTag = api.tags.removeFromTrade.useMutation({
		onSuccess: () => {
			onUpdate?.();
		},
	});

	const currentTagIds = tags.map((t) => t.tagId);

	return (
		<div className="flex items-center gap-1">
			{tags.slice(0, maxDisplay).map((tt) => (
				<Badge
					className="group gap-1 px-1 py-0 text-[10px]"
					key={tt.tagId}
					style={{
						borderColor: tt.tag.color ?? undefined,
						color: tt.tag.color ?? undefined,
					}}
					variant="outline"
				>
					{tt.tag.name}
					<button
						className="opacity-0 transition-opacity group-hover:opacity-100"
						onClick={(e) => {
							e.stopPropagation();
							removeTag.mutate({ tradeId, tagId: tt.tagId });
						}}
						type="button"
					>
						<X className="h-2.5 w-2.5" />
					</button>
				</Badge>
			))}
			{tags.length > maxDisplay && (
				<Badge className="px-1 py-0 text-[10px]" variant="secondary">
					+{tags.length - maxDisplay}
				</Badge>
			)}
			<TagSelector
				currentTagIds={currentTagIds}
				onUpdate={onUpdate}
				tradeId={tradeId}
			/>
		</div>
	);
}
