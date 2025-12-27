// ============================================
// Shared Symbol Definitions
// ============================================

export interface SymbolInfo {
	value: string;
	label: string;
	category?: string;
}

// ============================================
// FUTURES SYMBOLS
// ============================================

export const FUTURES_SYMBOLS: SymbolInfo[] = [
	// Equities - US Index
	{ value: "ES", label: "ES - S&P 500", category: "Equities" },
	{ value: "NQ", label: "NQ - Nasdaq 100", category: "Equities" },
	{ value: "YM", label: "YM - Dow Jones", category: "Equities" },
	{ value: "RTY", label: "RTY - Russell 2000", category: "Equities" },
	// Equities - Micro Index
	{ value: "MES", label: "MES - Micro S&P 500", category: "Equities" },
	{ value: "MNQ", label: "MNQ - Micro Nasdaq", category: "Equities" },
	{ value: "MYM", label: "MYM - Micro Dow", category: "Equities" },
	{ value: "M2K", label: "M2K - Micro Russell 2000", category: "Equities" },
	// Equities - International
	{ value: "NKD", label: "NKD - Nikkei Dollar Index", category: "Equities" },
	// Energy
	{ value: "CL", label: "CL - Crude Oil", category: "Energy" },
	{ value: "MCL", label: "MCL - Micro Crude Oil", category: "Energy" },
	{ value: "NG", label: "NG - Natural Gas", category: "Energy" },
	{ value: "MNG", label: "MNG - Micro Natural Gas", category: "Energy" },
	// Metals
	{ value: "GC", label: "GC - Gold", category: "Metals" },
	{ value: "MGC", label: "MGC - Micro Gold", category: "Metals" },
	{ value: "SI", label: "SI - Silver", category: "Metals" },
	{ value: "SIL", label: "SIL - Micro Silver", category: "Metals" },
	// Currencies - Standard
	{ value: "6A", label: "6A - Australian Dollar", category: "Currencies" },
	{ value: "6B", label: "6B - British Pound", category: "Currencies" },
	{ value: "6C", label: "6C - Canadian Dollar", category: "Currencies" },
	{ value: "6E", label: "6E - Euro", category: "Currencies" },
	{ value: "6J", label: "6J - Japanese Yen", category: "Currencies" },
	{ value: "6M", label: "6M - Mexican Peso", category: "Currencies" },
	{ value: "6N", label: "6N - New Zealand Dollar", category: "Currencies" },
	{ value: "6S", label: "6S - Swiss Franc", category: "Currencies" },
	// Currencies - Micro
	{ value: "M6A", label: "M6A - Micro AUD", category: "Currencies" },
	{ value: "M6B", label: "M6B - Micro GBP", category: "Currencies" },
	{ value: "M6E", label: "M6E - Micro EUR", category: "Currencies" },
	{ value: "MCD", label: "MCD - Micro CAD", category: "Currencies" },
	{ value: "MSF", label: "MSF - Micro CHF", category: "Currencies" },
	{ value: "MBT", label: "MBT - Micro Bitcoin", category: "Currencies" },
	// Interest Rates
	{ value: "ZB", label: "ZB - 30-Year Treasury", category: "Interest Rates" },
	{ value: "ZN", label: "ZN - 10-Year Treasury", category: "Interest Rates" },
	{ value: "ZF", label: "ZF - 5-Year Treasury", category: "Interest Rates" },
	{ value: "ZT", label: "ZT - 2-Year Treasury", category: "Interest Rates" },
	{ value: "TN", label: "TN - T-Note", category: "Interest Rates" },
	{ value: "UB", label: "UB - Ultra 10-Year", category: "Interest Rates" },
	// Agriculture - Grains
	{ value: "ZC", label: "ZC - Corn", category: "Agriculture" },
	{ value: "XC", label: "XC - Mini Corn", category: "Agriculture" },
	{ value: "ZW", label: "ZW - Wheat", category: "Agriculture" },
	{ value: "ZO", label: "ZO - Oats", category: "Agriculture" },
	{ value: "ZR", label: "ZR - Rough Rice", category: "Agriculture" },
	// Agriculture - Soy
	{ value: "ZS", label: "ZS - Soybeans", category: "Agriculture" },
	{ value: "ZL", label: "ZL - Soybean Oil", category: "Agriculture" },
	{ value: "ZM", label: "ZM - Soybean Meal", category: "Agriculture" },
	// Livestock
	{ value: "LE", label: "LE - Live Cattle", category: "Livestock" },
	{ value: "GF", label: "GF - Feeder Cattle", category: "Livestock" },
	{ value: "HE", label: "HE - Lean Hogs", category: "Livestock" },
];

// ============================================
// FOREX SYMBOLS
// ============================================

export const FOREX_SYMBOLS: SymbolInfo[] = [
	// Majors
	{ value: "EUR/USD", label: "EUR/USD - Euro/US Dollar", category: "Majors" },
	{
		value: "GBP/USD",
		label: "GBP/USD - British Pound/US Dollar",
		category: "Majors",
	},
	{
		value: "USD/JPY",
		label: "USD/JPY - US Dollar/Japanese Yen",
		category: "Majors",
	},
	{
		value: "USD/CHF",
		label: "USD/CHF - US Dollar/Swiss Franc",
		category: "Majors",
	},
	{
		value: "AUD/USD",
		label: "AUD/USD - Australian Dollar/US Dollar",
		category: "Majors",
	},
	{
		value: "USD/CAD",
		label: "USD/CAD - US Dollar/Canadian Dollar",
		category: "Majors",
	},
	{
		value: "NZD/USD",
		label: "NZD/USD - New Zealand Dollar/US Dollar",
		category: "Majors",
	},
	// JPY Crosses
	{ value: "EUR/JPY", label: "EUR/JPY - Euro/Yen", category: "JPY Crosses" },
	{ value: "GBP/JPY", label: "GBP/JPY - Pound/Yen", category: "JPY Crosses" },
	{ value: "AUD/JPY", label: "AUD/JPY - Aussie/Yen", category: "JPY Crosses" },
	{ value: "NZD/JPY", label: "NZD/JPY - Kiwi/Yen", category: "JPY Crosses" },
	{ value: "CAD/JPY", label: "CAD/JPY - Loonie/Yen", category: "JPY Crosses" },
	{ value: "CHF/JPY", label: "CHF/JPY - Swissy/Yen", category: "JPY Crosses" },
	// EUR Crosses
	{ value: "EUR/GBP", label: "EUR/GBP - Euro/Pound", category: "EUR Crosses" },
	{ value: "EUR/AUD", label: "EUR/AUD - Euro/Aussie", category: "EUR Crosses" },
	{ value: "EUR/CAD", label: "EUR/CAD - Euro/Loonie", category: "EUR Crosses" },
	{ value: "EUR/CHF", label: "EUR/CHF - Euro/Swissy", category: "EUR Crosses" },
	{ value: "EUR/NZD", label: "EUR/NZD - Euro/Kiwi", category: "EUR Crosses" },
	// GBP Crosses
	{
		value: "GBP/AUD",
		label: "GBP/AUD - Pound/Aussie",
		category: "GBP Crosses",
	},
	{
		value: "GBP/CAD",
		label: "GBP/CAD - Pound/Loonie",
		category: "GBP Crosses",
	},
	{
		value: "GBP/CHF",
		label: "GBP/CHF - Pound/Swissy",
		category: "GBP Crosses",
	},
	{ value: "GBP/NZD", label: "GBP/NZD - Pound/Kiwi", category: "GBP Crosses" },
	// Other Crosses
	{
		value: "AUD/CAD",
		label: "AUD/CAD - Aussie/Loonie",
		category: "Other Crosses",
	},
	{
		value: "AUD/CHF",
		label: "AUD/CHF - Aussie/Swissy",
		category: "Other Crosses",
	},
	{
		value: "AUD/NZD",
		label: "AUD/NZD - Aussie/Kiwi",
		category: "Other Crosses",
	},
	{
		value: "NZD/CAD",
		label: "NZD/CAD - Kiwi/Loonie",
		category: "Other Crosses",
	},
	{
		value: "NZD/CHF",
		label: "NZD/CHF - Kiwi/Swissy",
		category: "Other Crosses",
	},
	{
		value: "CAD/CHF",
		label: "CAD/CHF - Loonie/Swissy",
		category: "Other Crosses",
	},
];

// ============================================
// ALL SYMBOLS (Combined)
// ============================================

export const ALL_SYMBOLS = [...FUTURES_SYMBOLS, ...FOREX_SYMBOLS];

// ============================================
// SYMBOL MAPPING FOR DATA PROVIDERS
// Maps our symbols to provider-specific formats
// ============================================

export const TWELVE_DATA_SYMBOL_MAP: Record<string, string> = {
	// Futures -> Twelve Data continuous contract format
	...Object.fromEntries(FUTURES_SYMBOLS.map((s) => [s.value, `${s.value}1!`])),
	// Forex stays the same
	...Object.fromEntries(FOREX_SYMBOLS.map((s) => [s.value, s.value])),
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getSymbolInfo(symbol: string): SymbolInfo | undefined {
	return ALL_SYMBOLS.find((s) => s.value === symbol);
}

export function getSymbolLabel(symbol: string): string {
	return getSymbolInfo(symbol)?.label ?? symbol;
}

export function getSymbolsByType(type: "futures" | "forex"): SymbolInfo[] {
	return type === "futures" ? FUTURES_SYMBOLS : FOREX_SYMBOLS;
}

export function isValidSymbol(symbol: string): boolean {
	return ALL_SYMBOLS.some((s) => s.value === symbol);
}

export function getSymbolCategory(symbol: string): string | undefined {
	return getSymbolInfo(symbol)?.category;
}
