"use client";

import { CalendarIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type DateRange = {
	from: Date;
	to: Date;
	label: string;
};

export type PresetKey =
	| "today"
	| "yesterday"
	| "last7days"
	| "last30days"
	| "thisWeek"
	| "lastWeek"
	| "thisMonth"
	| "lastMonth"
	| "thisYear"
	| "lastYear"
	| "allTime";

const presets: { key: PresetKey; label: string; getRange: () => DateRange }[] =
	[
		{
			key: "today",
			label: "Today",
			getRange: () => {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const end = new Date();
				end.setHours(23, 59, 59, 999);
				return { from: today, to: end, label: "Today" };
			},
		},
		{
			key: "yesterday",
			label: "Yesterday",
			getRange: () => {
				const yesterday = new Date();
				yesterday.setDate(yesterday.getDate() - 1);
				yesterday.setHours(0, 0, 0, 0);
				const end = new Date();
				end.setDate(end.getDate() - 1);
				end.setHours(23, 59, 59, 999);
				return { from: yesterday, to: end, label: "Yesterday" };
			},
		},
		{
			key: "last7days",
			label: "Last 7 Days",
			getRange: () => {
				const from = new Date();
				from.setDate(from.getDate() - 6);
				from.setHours(0, 0, 0, 0);
				const to = new Date();
				to.setHours(23, 59, 59, 999);
				return { from, to, label: "Last 7 Days" };
			},
		},
		{
			key: "last30days",
			label: "Last 30 Days",
			getRange: () => {
				const from = new Date();
				from.setDate(from.getDate() - 29);
				from.setHours(0, 0, 0, 0);
				const to = new Date();
				to.setHours(23, 59, 59, 999);
				return { from, to, label: "Last 30 Days" };
			},
		},
		{
			key: "thisWeek",
			label: "This Week",
			getRange: () => {
				const today = new Date();
				const dayOfWeek = today.getDay();
				const from = new Date(today);
				from.setDate(today.getDate() - dayOfWeek);
				from.setHours(0, 0, 0, 0);
				const to = new Date();
				to.setHours(23, 59, 59, 999);
				return { from, to, label: "This Week" };
			},
		},
		{
			key: "lastWeek",
			label: "Last Week",
			getRange: () => {
				const today = new Date();
				const dayOfWeek = today.getDay();
				const from = new Date(today);
				from.setDate(today.getDate() - dayOfWeek - 7);
				from.setHours(0, 0, 0, 0);
				const to = new Date(from);
				to.setDate(from.getDate() + 6);
				to.setHours(23, 59, 59, 999);
				return { from, to, label: "Last Week" };
			},
		},
		{
			key: "thisMonth",
			label: "This Month",
			getRange: () => {
				const today = new Date();
				const from = new Date(today.getFullYear(), today.getMonth(), 1);
				const to = new Date();
				to.setHours(23, 59, 59, 999);
				return { from, to, label: "This Month" };
			},
		},
		{
			key: "lastMonth",
			label: "Last Month",
			getRange: () => {
				const today = new Date();
				const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
				const to = new Date(today.getFullYear(), today.getMonth(), 0);
				to.setHours(23, 59, 59, 999);
				return { from, to, label: "Last Month" };
			},
		},
		{
			key: "thisYear",
			label: "This Year",
			getRange: () => {
				const today = new Date();
				const from = new Date(today.getFullYear(), 0, 1);
				const to = new Date();
				to.setHours(23, 59, 59, 999);
				return { from, to, label: "This Year" };
			},
		},
		{
			key: "lastYear",
			label: "Last Year",
			getRange: () => {
				const today = new Date();
				const from = new Date(today.getFullYear() - 1, 0, 1);
				const to = new Date(today.getFullYear() - 1, 11, 31);
				to.setHours(23, 59, 59, 999);
				return { from, to, label: "Last Year" };
			},
		},
		{
			key: "allTime",
			label: "All Time",
			getRange: () => {
				const from = new Date(2000, 0, 1);
				const to = new Date();
				to.setHours(23, 59, 59, 999);
				return { from, to, label: "All Time" };
			},
		},
	];

export function DateRangePicker({
	value,
	onChange,
	className,
	align = "start",
}: {
	value?: DateRange;
	onChange: (range: DateRange) => void;
	className?: string;
	align?: "start" | "center" | "end";
}) {
	const [open, setOpen] = useState(false);

	const handleSelect = (preset: (typeof presets)[0]) => {
		onChange(preset.getRange());
		setOpen(false);
	};

	return (
		<DropdownMenu onOpenChange={setOpen} open={open}>
			<DropdownMenuTrigger asChild>
				<Button
					className={cn(
						"justify-between gap-2 font-mono text-xs",
						className,
					)}
					size="sm"
					variant="outline"
				>
					<CalendarIcon className="h-3.5 w-3.5" />
					<span>{value?.label ?? "Select Period"}</span>
					<ChevronDown className="h-3.5 w-3.5 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align={align} className="w-[200px]">
				{presets.slice(0, 4).map((preset) => (
					<DropdownMenuItem
						className="font-mono text-xs"
						key={preset.key}
						onClick={() => handleSelect(preset)}
					>
						{preset.label}
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				{presets.slice(4, 8).map((preset) => (
					<DropdownMenuItem
						className="font-mono text-xs"
						key={preset.key}
						onClick={() => handleSelect(preset)}
					>
						{preset.label}
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				{presets.slice(8).map((preset) => (
					<DropdownMenuItem
						className="font-mono text-xs"
						key={preset.key}
						onClick={() => handleSelect(preset)}
					>
						{preset.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { presets as dateRangePresets };
