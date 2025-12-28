import { useCallback, useMemo } from "react";
import {
	formatDateInTimezone,
	formatDateTimeInTimezone,
	formatTimeInTimezone,
	getTimezoneAbbreviation,
} from "@/lib/timezone";
import { api } from "@/trpc/react";

/**
 * Hook that provides the user's timezone and timezone-aware formatting functions.
 * Falls back to browser timezone if user settings haven't loaded yet.
 */
export function useTimezone() {
	const { data: settings, isLoading } = api.settings.get.useQuery();

	// Get user's timezone, falling back to browser timezone
	const timezone = useMemo(() => {
		if (settings?.timezone) {
			return settings.timezone;
		}
		// Fallback to browser timezone
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	}, [settings?.timezone]);

	// Get timezone abbreviation (e.g., "EST", "PST")
	const timezoneAbbr = useMemo(() => {
		return getTimezoneAbbreviation(timezone);
	}, [timezone]);

	// Memoized formatting functions
	const formatDate = useCallback(
		(
			date: Date | string | null | undefined,
			options?: { format?: string; includeYear?: boolean },
		) => {
			return formatDateInTimezone(date, timezone, options);
		},
		[timezone],
	);

	const formatTime = useCallback(
		(
			date: Date | string | null | undefined,
			options?: { format?: string; includeSeconds?: boolean },
		) => {
			return formatTimeInTimezone(date, timezone, options);
		},
		[timezone],
	);

	const formatDateTime = useCallback(
		(
			date: Date | string | null | undefined,
			options?: { dateFormat?: string; timeFormat?: string },
		) => {
			return formatDateTimeInTimezone(date, timezone, options);
		},
		[timezone],
	);

	return {
		timezone,
		timezoneAbbr,
		isLoading,
		formatDate,
		formatTime,
		formatDateTime,
	};
}
