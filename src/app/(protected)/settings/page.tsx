import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsContent } from "./_components/settings-content";

function SettingsLoading() {
	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<div>
				<Skeleton className="h-9 w-32" />
				<Skeleton className="mt-2 h-5 w-64" />
			</div>
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-[400px] w-full" />
		</div>
	);
}

export default function SettingsPage() {
	return (
		<Suspense fallback={<SettingsLoading />}>
			<SettingsContent />
		</Suspense>
	);
}
